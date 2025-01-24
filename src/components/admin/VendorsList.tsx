import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Store, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export function VendorsList() {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['adminVendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Vendors</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage vendor accounts and verification</p>
        </div>
        <Button>
          <Store className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {vendors?.map((vendor) => (
            <li key={vendor.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    {vendor.logo_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={vendor.logo_url}
                        alt={vendor.business_name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Store className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{vendor.business_name}</div>
                      <div className="text-sm text-gray-500">{vendor.users.email}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">{vendor.address}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {vendor.is_verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </span>
                  )}
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}