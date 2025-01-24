import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Store, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '../ui/Button';

type VendorStatus = 'all' | 'pending' | 'approved';

export function VendorManagement() {
  const [status, setStatus] = useState<VendorStatus>('all');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['adminVendors', status],
    queryFn: async () => {
      let query = supabase
        .from('vendors')
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('is_verified', status === 'approved');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const updateVendorMutation = useMutation({
    mutationFn: async ({ id, isVerified }: { id: string; isVerified: boolean }) => {
      const { error } = await supabase
        .from('vendors')
        .update({ is_verified: isVerified })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVendors'] });
    }
  });

  const filteredVendors = vendors?.filter(vendor => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      vendor.business_name.toLowerCase().includes(searchLower) ||
      vendor.users.email.toLowerCase().includes(searchLower) ||
      vendor.users.full_name.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Vendor Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as VendorStatus)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Vendors</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {filteredVendors?.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {status === 'pending' 
                ? 'No vendors pending approval'
                : status === 'approved'
                ? 'No approved vendors'
                : 'No vendors match your search'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredVendors?.map((vendor) => (
              <div key={vendor.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {vendor.logo_url ? (
                        <img
                          src={vendor.logo_url}
                          alt={vendor.business_name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <Store className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {vendor.business_name}
                        {vendor.is_verified ? (
                          <CheckCircle className="inline-block ml-2 h-5 w-5 text-primary-500" />
                        ) : (
                          <AlertTriangle className="inline-block ml-2 h-5 w-5 text-warning-500" />
                        )}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>{vendor.users.full_name} • {vendor.users.email}</p>
                        <p className="mt-1">
                          {vendor.city}, {vendor.state}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => {
                        // Implement view details functionality
                        console.log('View vendor details:', vendor.id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>

                    {vendor.is_verified ? (
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex items-center"
                        onClick={() => updateVendorMutation.mutate({ 
                          id: vendor.id, 
                          isVerified: false 
                        })}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Disable
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center"
                        onClick={() => updateVendorMutation.mutate({ 
                          id: vendor.id, 
                          isVerified: true 
                        })}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p className="font-medium">Business Address:</p>
                  <p>{vendor.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}