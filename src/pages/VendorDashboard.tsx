import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendorByUserId } from '../lib/vendors';
import { getVendorOrders } from '../lib/orders';
import { Store, Package2, Users, TrendingUp, Ban as Bank } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BankDetailsForm } from '../components/vendor/BankDetailsForm';

export function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: vendor } = useQuery({
    queryKey: ['vendor'],
    queryFn: getVendorByUserId
  });

  const { data: bankDetails } = useQuery({
    queryKey: ['vendorBankDetails', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) return null;
      const { data, error } = await supabase
        .from('vendor_bank_details')
        .select('*')
        .eq('vendor_id', vendor.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id
  });

  const { data: orders } = useQuery({
    queryKey: ['vendorOrders', vendor?.id],
    queryFn: () => vendor ? getVendorOrders(vendor.id) : Promise.resolve([]),
    enabled: !!vendor
  });

  if (!vendor && !isRegistering) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Become a Vendor</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start your journey as a vendor and create group buy opportunities
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsRegistering(true)}>Register as Vendor</Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Orders',
      value: orders?.length || 0,
      icon: Package2,
    },
    {
      name: 'Active Customers',
      value: new Set(orders?.map(order => order.user_id)).size || 0,
      icon: Users,
    },
    {
      name: 'Total Revenue',
      value: `$${orders?.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2) || '0.00'}`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="mt-2 text-gray-600">{vendor?.business_name}</p>
        
        {vendor?.is_verified && !bankDetails && (
          <div className="mt-4 bg-warning-50 border border-warning-200 p-4 rounded-md">
            <div className="flex">
              <Bank className="h-5 w-5 text-warning-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-warning-800">
                  Bank Details Required
                </h3>
                <div className="mt-2 text-sm text-warning-700">
                  <p>Please add your bank account details to receive payments.</p>
                  <Button
                    variant="warning"
                    size="sm"
                    className="mt-3"
                    onClick={() => setShowBankDetails(true)}
                  >
                    Add Bank Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bank Details Modal */}
      {showBankDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {bankDetails ? 'Update Bank Details' : 'Add Bank Details'}
            </h2>
            <BankDetailsForm
              vendorId={vendor!.id}
              existingDetails={bankDetails}
              onSuccess={() => setShowBankDetails(false)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`${
                activeTab === 'orders'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Orders
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'orders' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {orders?.map((order) => (
                  <li key={order.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={order.products.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                            alt={order.products.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                          <div className="ml-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {order.products.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {order.users.full_name} ({order.users.email})
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${order.total_amount}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {order.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}