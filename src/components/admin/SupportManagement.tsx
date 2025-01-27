import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, Store, Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface SupportUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  support_bank_details?: {
    bank_name: string;
    account_name: string;
    account_number: string;
  };
  assigned_vendors: Array<{
    id: string;
    business_name: string;
  }>;
  monthly_stats?: {
    total_transactions: number;
    commission: number;
  };
}

interface VendorStats {
  vendor_id: string;
  vendor_name: string;
  total_transactions: number;
  commission: number;
}

export function SupportManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const queryClient = useQueryClient();

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  // Function to export data to CSV
  const exportToCSV = () => {
    if (!supportUsers) return;

    // Prepare CSV data
    const headers = [
      'Full Name',
      'Email',
      'Bank Name',
      'Account Name',
      'Account Number',
      'Total Transactions',
      'Commission (0.5%)'
    ];

    const rows = supportUsers.map(user => [
      user.full_name,
      user.email,
      user.support_bank_details?.bank_name || 'Not provided',
      user.support_bank_details?.account_name || 'Not provided',
      user.support_bank_details?.account_number || 'Not provided',
      user.monthly_stats?.total_transactions.toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }),
      user.monthly_stats?.commission.toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN'
      })
    ]);

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const [year, month] = selectedMonth.split('-');
    const filename = `support-commissions-${year}-${month}.csv`;

    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Fetch support users with their assigned vendors and bank details
  const { data: supportUsers, isLoading: loadingSupport } = useQuery({
    queryKey: ['supportUsers', selectedMonth],
    queryFn: async () => {
      // First get all support users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          created_at,
          support_bank_details (
            bank_name,
            account_name,
            account_number
          ),
          support_vendor_assignments (
            vendors (
              id,
              business_name
            )
          )
        `)
        .eq('roles.name', 'support')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Then get monthly stats for each support user
      const monthDate = new Date(selectedMonth + '-01');
      const statsPromises = users.map(async (user) => {
        const { data: stats } = await supabase.rpc('get_support_monthly_stats', {
          support_id: user.id,
          month: monthDate.toISOString()
        });

        const vendorStats = stats as VendorStats[] || [];
        const totalTransactions = vendorStats.reduce((sum, s) => sum + s.total_transactions, 0);
        const commission = vendorStats.reduce((sum, s) => sum + s.commission, 0);

        return {
          ...user,
          assigned_vendors: user.support_vendor_assignments.map(a => a.vendors),
          monthly_stats: {
            total_transactions: totalTransactions,
            commission: commission
          }
        } as SupportUser;
      });

      return Promise.all(statsPromises);
    }
  });

  // Fetch verified vendors
  const { data: vendors } = useQuery({
    queryKey: ['verifiedVendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name')
        .eq('is_verified', true)
        .order('business_name');

      if (error) throw error;
      return data;
    }
  });

  // Create support user mutation
  const createSupportMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });
      if (authError) throw authError;

      // 2. Get support role ID
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'support')
        .single();

      // 3. Update user record with role and full name
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role_id: roleData.id,
          full_name: data.fullName
        })
        .eq('id', authData.user!.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportUsers'] });
      setShowCreateModal(false);
      setFormData({ email: '', password: '', fullName: '' });
    }
  });

  // Assign vendor mutation
  const assignVendorMutation = useMutation({
    mutationFn: async ({ supportId, vendorId }: { supportId: string; vendorId: string }) => {
      const { error } = await supabase
        .from('support_vendor_assignments')
        .upsert({ 
          support_user_id: supportId,
          vendor_id: vendorId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportUsers'] });
    }
  });

  // Unassign vendor mutation
  const unassignVendorMutation = useMutation({
    mutationFn: async ({ supportId, vendorId }: { supportId: string; vendorId: string }) => {
      const { error } = await supabase
        .from('support_vendor_assignments')
        .delete()
        .match({ 
          support_user_id: supportId,
          vendor_id: vendorId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportUsers'] });
    }
  });

  if (loadingSupport) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Support Staff Management</h2>
          <p className="text-sm text-gray-600">Manage support staff and their commissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={!supportUsers?.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Support Staff
          </Button>
        </div>
      </div>

      {/* Support Users List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {supportUsers?.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No support staff</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add support staff to help manage vendors
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {supportUsers?.map((support) => (
              <div key={support.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{support.full_name}</h4>
                    <p className="text-sm text-gray-500">{support.email}</p>
                    {support.support_bank_details ? (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Bank: {support.support_bank_details.bank_name}</p>
                        <p>Account: {support.support_bank_details.account_number}</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-warning-600">Bank details not provided</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Monthly Commission:</p>
                    <p className="text-lg font-semibold text-primary-600">
                      ₦{support.monthly_stats?.commission.toLocaleString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setSelectedSupport(support.id);
                        setShowAssignModal(true);
                      }}
                    >
                      <Store className="h-4 w-4 mr-2" />
                      Manage Vendors
                    </Button>
                  </div>
                </div>

                {/* Assigned Vendors */}
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Assigned Vendors:</h5>
                  <div className="flex flex-wrap gap-2">
                    {support.assigned_vendors.length === 0 ? (
                      <p className="text-sm text-gray-500">No vendors assigned</p>
                    ) : (
                      support.assigned_vendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                        >
                          {vendor.business_name}
                          <button
                            onClick={() => unassignVendorMutation.mutate({
                              supportId: support.id,
                              vendorId: vendor.id
                            })}
                            className="ml-2 text-gray-500 hover:text-danger-500"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Support User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Support Staff
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              createSupportMutation.mutate(formData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSupportMutation.isPending}
                >
                  {createSupportMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Vendors Modal */}
      {showAssignModal && selectedSupport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Vendors
            </h3>
            <div className="space-y-4">
              {vendors?.map((vendor) => {
                const isAssigned = supportUsers?.find(
                  (s) => s.id === selectedSupport
                )?.assigned_vendors.some(
                  (v) => v.id === vendor.id
                );

                return (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {vendor.business_name}
                    </span>
                    <Button
                      variant={isAssigned ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => {
                        if (isAssigned) {
                          unassignVendorMutation.mutate({
                            supportId: selectedSupport,
                            vendorId: vendor.id
                          });
                        } else {
                          assignVendorMutation.mutate({
                            supportId: selectedSupport,
                            vendorId: vendor.id
                          });
                        }
                      }}
                    >
                      {isAssigned ? 'Unassign' : 'Assign'}
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSupport(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}