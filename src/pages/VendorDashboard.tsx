import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendorByUserId } from '../lib/vendors';
import { getVendorOrders } from '../lib/orders';
import { Store, Package2, Users, TrendingUp, Ban as Bank, Building2, Settings } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BankDetailsChangeRequest } from '../components/vendor/BankDetailsChangeRequest';
import { VendorShopSettings } from '../components/vendor/VendorShopSettings';
import { useAuth } from '../contexts/AuthContext';
import { ProfileSection } from '../components/profile/ProfileSection';

export function VendorDashboard() {
  const { user } = useAuth();
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
  const [showShopSettings, setShowShopSettings] = useState(false);
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

  if (!user) return null;

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
      value: `₦${orders?.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString() || '0'}`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="mt-2 text-gray-600">{vendor?.business_name}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowShopSettings(true)}
          className="flex items-center"
        >
          <Settings className="h-4 w-4 mr-2" />
          Shop Settings
        </Button>
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
                onClick={() => setShowBankDetailsModal(true)}
              >
                Request Change
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
        </div>

        {/* Stats and Orders Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white overflow-hidden shadow rounded-lg p-6"
              >
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
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Recent Orders</h2>
              <div className="space-y-4">
                {orders?.slice(0, 5).map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
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
                        <p className="text-lg font-semibold text-gray-900">
                          ₦{order.total_amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {order.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details Change Request Modal */}
      {showBankDetailsModal && vendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <BankDetailsChangeRequest
              vendorId={vendor.id}
              onClose={() => setShowBankDetailsModal(false)}
            />
          </div>
        </div>
      )}

      {/* Shop Settings Modal */}
      {showShopSettings && vendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <VendorShopSettings
              vendorId={vendor.id}
              currentTheme={vendor.shop_theme}
              currentLogo={vendor.logo_url}
              onClose={() => setShowShopSettings(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}