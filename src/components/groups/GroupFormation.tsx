import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Users, Calendar, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Product } from '../../types';

interface GroupFormationProps {
  product: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function GroupFormation({ product, onSuccess, onCancel }: GroupFormationProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetSize: 5,
    shareDate: '',
    state: '',
    city: '',
    maxDistance: 50
  });

  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('product_groups')
        .insert({
          product_id: product.id,
          name: data.name,
          description: data.description,
          target_size: data.targetSize,
          current_size: 1,
          status: 'forming',
          location_state: data.state,
          location_city: data.city,
          max_distance_km: data.maxDistance,
          created_by: user.id,
          share_date: new Date(data.shareDate).toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productGroups'] });
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroupMutation.mutate(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Group Buy</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Group Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Users className="w-4 h-4 inline mr-1" />
              Target Group Size
            </label>
            <input
              type="number"
              min="2"
              max="50"
              value={formData.targetSize}
              onChange={(e) => setFormData({ ...formData, targetSize: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 inline mr-1" />
              Share Date
            </label>
            <input
              type="date"
              value={formData.shareDate}
              onChange={(e) => setFormData({ ...formData, shareDate: e.target.value })}
              min={new Date(product.purchase_window_end).toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4 inline mr-1" />
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Distance (km)
            </label>
            <select
              value={formData.maxDistance}
              onChange={(e) => setFormData({ ...formData, maxDistance: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createGroupMutation.isPending}
          >
            {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
          </Button>
        </div>
      </form>
    </div>
  );
}