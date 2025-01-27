import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Map, Navigation, Calendar, Clock, MapPin, RotateCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Route {
  id: string;
  name: string;
  date: string;
  status: 'draft' | 'active' | 'completed';
  total_distance: number;
  estimated_duration: string;
  stops: Array<{
    id: string;
    stop_number: number;
    order_id: string;
    address: string;
    latitude: number;
    longitude: number;
    estimated_arrival: string;
    actual_arrival: string | null;
    notes: string;
  }>;
}

export function RouteOptimizer() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const queryClient = useQueryClient();

  // Fetch routes for selected date
  const { data: routes, isLoading } = useQuery({
    queryKey: ['deliveryRoutes', selectedDate],
    queryFn: async () => {
      const { data: routesData, error: routesError } = await supabase
        .from('delivery_routes')
        .select(`
          *,
          route_stops (
            *,
            orders (
              id,
              user_id,
              users (
                full_name,
                address
              )
            )
          )
        `)
        .eq('date', selectedDate)
        .order('created_at', { ascending: false });

      if (routesError) throw routesError;
      return routesData as Route[];
    }
  });

  // Create new route
  const createRouteMutation = useMutation({
    mutationFn: async ({ name, date }: { name: string; date: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get vendor ID
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!vendor) throw new Error('Vendor not found');

      // Create route
      const { data: route, error: routeError } = await supabase
        .from('delivery_routes')
        .insert({
          vendor_id: vendor.id,
          name,
          date,
          status: 'draft'
        })
        .select()
        .single();

      if (routeError) throw routeError;
      return route;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRoutes'] });
      setShowCreateModal(false);
      setNewRouteName('');
    }
  });

  // Optimize route
  const optimizeRouteMutation = useMutation({
    mutationFn: async (routeId: string) => {
      const { error } = await supabase.rpc('optimize_route_order', {
        route_id_param: routeId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRoutes'] });
    }
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
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Route Optimization</h2>
          <p className="text-sm text-gray-600">Plan and optimize your delivery routes</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <Button onClick={() => setShowCreateModal(true)}>
            <Map className="h-4 w-4 mr-2" />
            Create Route
          </Button>
        </div>
      </div>

      {routes?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Navigation className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No routes planned</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a new route to start planning your deliveries
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {routes?.map((route) => (
            <div key={route.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{route.name}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(route.date).toLocaleDateString()}
                  </div>
                  {route.total_distance && (
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Navigation className="h-4 w-4 mr-1" />
                      {route.total_distance.toFixed(1)} km
                    </div>
                  )}
                  {route.estimated_duration && (
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Est. {route.estimated_duration}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => optimizeRouteMutation.mutate(route.id)}
                  disabled={optimizeRouteMutation.isPending}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Optimize Route
                </Button>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Stops</h4>
                <div className="space-y-4">
                  {route.stops
                    .sort((a, b) => a.stop_number - b.stop_number)
                    .map((stop) => (
                      <div
                        key={stop.id}
                        className="flex items-start p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                          {stop.stop_number}
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {stop.orders.users.full_name}
                          </p>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {stop.address}
                          </div>
                          {stop.estimated_arrival && (
                            <div className="mt-1 text-sm text-gray-500">
                              Est. Arrival: {new Date(stop.estimated_arrival).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Route Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Route
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              createRouteMutation.mutate({
                name: newRouteName,
                date: selectedDate
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Route Name
                  </label>
                  <input
                    type="text"
                    value={newRouteName}
                    onChange={(e) => setNewRouteName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
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
                  disabled={createRouteMutation.isPending}
                >
                  {createRouteMutation.isPending ? 'Creating...' : 'Create Route'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}