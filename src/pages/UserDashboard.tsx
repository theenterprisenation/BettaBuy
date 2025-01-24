import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserOrders } from '../lib/orders';
import { Package2, Clock, CheckCircle, XCircle } from 'lucide-react';

export function UserDashboard() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['userOrders'],
    queryFn: getUserOrders
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-danger-600">
          <h3 className="text-lg font-semibold">Error loading orders</h3>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-primary-500';
      case 'cancelled':
        return 'text-danger-500';
      case 'pending':
        return 'text-warning-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-primary-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-danger-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-500" />;
      default:
        return <Package2 className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">Track and manage your group buy orders</p>
      </div>

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
                      <h4 className="text-lg font-semibold text-gray-900">{order.products.name}</h4>
                      <p className="text-sm text-gray-500">{order.products.vendors.business_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className={`ml-2 text-sm capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="text-sm text-gray-500">
                      Quantity: <span className="font-semibold">{order.quantity}</span>
                    </p>
                    <p className="mt-2 sm:mt-0 sm:ml-6 text-sm text-gray-500">
                      Total: <span className="font-semibold text-primary-600">${order.total_amount}</span>
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                    Ordered on {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}