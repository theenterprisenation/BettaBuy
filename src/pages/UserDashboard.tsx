import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserOrders } from '../lib/orders';
import { Package2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileSection } from '../components/profile/ProfileSection';

export function UserDashboard() {
  const { user } = useAuth();
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['userOrders'],
    queryFn: getUserOrders
  });

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your account and orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <ProfileSection userId={user.id} />
        </div>

        {/* Orders Section */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">My Orders</h2>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-danger-600">
                  <h3 className="text-lg font-semibold">Error loading orders</h3>
                  <p>Please try again later</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders?.map((order) => (
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
                              {order.products.vendors.business_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {order.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-primary-500" />
                          ) : order.status === 'cancelled' ? (
                            <XCircle className="h-5 w-5 text-danger-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-warning-500" />
                          )}
                          <span className={`ml-2 text-sm capitalize ${
                            order.status === 'completed' ? 'text-primary-600' :
                            order.status === 'cancelled' ? 'text-danger-600' :
                            'text-warning-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between text-sm text-gray-500">
                        <div>
                          <p>Quantity: {order.quantity}</p>
                          <p>Total: ₦{order.total_amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p>Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                          <p>Delivery: {order.delivery_option}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {orders?.length === 0 && (
                    <div className="text-center py-8">
                      <Package2 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start shopping to see your orders here
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}