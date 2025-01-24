import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck, Calendar, Printer, MapPin, Package, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';

type ViewMode = 'day' | 'week';
type DeliveryStatus = 'all' | 'pending' | 'in-transit' | 'delivered';

export function DeliveryMonitoring() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [status, setStatus] = useState<DeliveryStatus>('all');

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries', viewMode, selectedDate, status],
    queryFn: async () => {
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      
      if (viewMode === 'week') {
        startDate.setDate(startDate.getDate() - startDate.getDay());
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
      }

      const query = supabase
        .from('orders')
        .select(`
          *,
          users (
            full_name,
            email,
            address
          ),
          products (
            name,
            image_url,
            vendors (
              business_name,
              address
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (status !== 'all') {
        query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    }
  });

  const handlePrint = (orders: Order[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Delivery Schedule - ${selectedDate.toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .order { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
            .order-header { font-weight: bold; margin-bottom: 5px; }
            .address { color: #666; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
              .order { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Delivery Schedule</h1>
            <p>${selectedDate.toLocaleDateString()} ${viewMode === 'week' ? '(Week View)' : '(Day View)'}</p>
          </div>
          ${orders.map(order => `
            <div class="order">
              <div class="order-header">Order #${order.id.slice(0, 8)}</div>
              <p><strong>Customer:</strong> ${order.users.full_name}</p>
              <p><strong>Product:</strong> ${order.products.name}</p>
              <p><strong>Quantity:</strong> ${order.quantity}</p>
              <p><strong>Delivery Option:</strong> ${order.delivery_option}</p>
              <div class="address">
                <p><strong>Delivery Address:</strong></p>
                <p>${order.delivery_option === 'pickup' 
                  ? order.products.vendors.address 
                  : order.users.address}</p>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

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
        <h2 className="text-lg font-semibold text-gray-900">Delivery Monitoring</h2>
        <div className="flex items-center space-x-4">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="day">Daily View</option>
            <option value="week">Weekly View</option>
          </select>
          
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="rounded-md border-gray-300 text-sm"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>

          <Button
            onClick={() => deliveries && handlePrint(deliveries)}
            className="flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Schedule
          </Button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {deliveries?.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No deliveries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No deliveries scheduled for the selected {viewMode === 'day' ? 'day' : 'week'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {deliveries?.map((delivery) => (
              <div key={delivery.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={delivery.products.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                        alt={delivery.products.name}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Order #{delivery.id.slice(0, 8)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {delivery.products.name} × {delivery.quantity}
                      </p>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(delivery.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {delivery.users.full_name}
                      </p>
                      <p className="text-sm text-gray-500">{delivery.users.email}</p>
                      <div className="mt-1 flex items-center justify-end text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {delivery.delivery_option === 'pickup' 
                          ? 'Pickup at vendor'
                          : delivery.delivery_option === 'stockpiling'
                          ? 'Stockpiling'
                          : 'Home delivery'
                        }
                      </div>
                    </div>

                    <div>
                      <select
                        value={delivery.status}
                        onChange={async (e) => {
                          await supabase
                            .from('orders')
                            .update({ status: e.target.value })
                            .eq('id', delivery.id);
                        }}
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          delivery.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : delivery.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <div className="flex items-start">
                    <Package className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Delivery Details:</p>
                      <p>{delivery.delivery_option === 'pickup'
                        ? `Pickup at: ${delivery.products.vendors.address}`
                        : `Deliver to: ${delivery.users.address}`
                      }</p>
                      {delivery.delivery_details?.distance && (
                        <p>Distance: {delivery.delivery_details.distance}km</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}