import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Store, DollarSign, TrendingUp, Calendar, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BankDetailsForm } from '../components/support/BankDetailsForm';
import { useAuth } from '../contexts/AuthContext';
import { CopyToClipboard } from '../components/ui/CopyToClipboard';
import { ProfileSection } from '../components/profile/ProfileSection';

interface VendorStats {
  vendor_id: string;
  vendor_name: string;
  total_transactions: number;
  commission: number;
}

export function SupportDashboard() {
  const { user } = useAuth();
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  if (!user) return null;

  // Get support user's affiliate code
  const { data: affiliateData } = useQuery({
    queryKey: ['supportAffiliate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_affiliates')
        .select('code')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const affiliateLink = affiliateData?.code 
    ? `${window.location.origin}/vend?ref=${affiliateData.code}`
    : null;

  // Fetch bank details
  const { data: bankDetails } = useQuery({
    queryKey: ['supportBankDetails'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('support_bank_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    }
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ['supportStats', selectedMonth],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_support_monthly_stats', {
        support_id: user.id,
        month: `${selectedMonth}-01`
      });

      if (error) throw error;
      return data as VendorStats[];
    }
  });

  const totalCommission = stats?.reduce((sum, stat) => sum + stat.commission, 0) || 0;
  const totalTransactions = stats?.reduce((sum, stat) => sum + stat.total_transactions, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor your assigned vendors and commissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile and Bank Details Section */}
        <div className="space-y-8">
          <ProfileSection userId={user.id} />

          {/* Bank Details Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Building2 className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Bank Details</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBankDetails(true)}
              >
                {bankDetails ? 'Update Details' : 'Add Details'}
              </Button>
            </div>

            {bankDetails ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-500">Account Name:</span>{' '}
                  <span className="text-gray-900">{bankDetails.account_name}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-500">Bank Name:</span>{' '}
                  <span className="text-gray-900">{bankDetails.bank_name}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-500">Account Number:</span>{' '}
                  <span className="text-gray-900">{bankDetails.account_number}</span>
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">No bank details provided</p>
            )}
          </div>

          {/* Add Affiliate Link Section */}
          {affiliateLink && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Affiliate Link</h2>
              <p className="text-sm text-gray-600 mb-4">
                Share this link with potential vendors. When they sign up using your link, 
                they'll be automatically assigned to you.
              </p>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={affiliateLink}
                  readOnly
                  className="flex-1 p-2 border rounded-md bg-gray-50"
                />
                <CopyToClipboard
                  text={affiliateLink}
                  onCopy={() => {
                    // Optional: Show a success toast
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Month Selector */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Store className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Assigned Vendors
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {stats?.length || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Transactions
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        ₦{totalTransactions.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Commission (0.5%)
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        ₦{totalCommission.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendors List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Assigned Vendors
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {stats?.length === 0 ? (
                <div className="text-center py-12">
                  <Store className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors assigned</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Contact an administrator to get vendor assignments.
                  </p>
                </div>
              ) : (
                stats?.map((stat) => (
                  <div key={stat.vendor_id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {stat.vendor_name}
                        </h4>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <DollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          Monthly Transactions: ₦{stat.total_transactions.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Commission
                        </p>
                        <p className="text-lg text-primary-600">
                          ₦{stat.commission.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details Modal */}
      {showBankDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Bank Details</h2>
              <button
                onClick={() => setShowBankDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <BankDetailsForm />
          </div>
        </div>
      )}
    </div>
  );
}