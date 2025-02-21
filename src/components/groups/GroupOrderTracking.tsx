import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Package2, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface GroupOrderTrackingProps {
  groupId: string;
}

export function GroupOrderTracking({ groupId }: GroupOrderTrackingProps) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['groupOrders', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_orders')
        .select(`
          *,
          users (
            full_name,
            email
          ),
          products (
            name,
            price,
            image_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-primary-500" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-warning-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-danger-500" />;
      default:
        return <Package2 className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Group Orders</h3>

      {orders?.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg">
          <Package2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Be the first to place an order in this group
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {orders?.map((order) => (
              <li key={order.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={order.products.image_url}
                      alt={order.products.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        {order.products.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {order.users.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {order.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className="ml-2 text-sm capitalize text-gray-700">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      ₦{order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}