import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Users, Lock } from 'lucide-react';
import { Button } from '../ui/Button';

interface CreateGroupFormData {
  name: string;
  description: string;
  targetSize: number;
  shareDate: string;
  isPrivate: boolean;
  maxDistance: number;
  productId: string;
}

interface CreateGroupButtonProps {
  productId: string;
  vendorId: string;
}

export function CreateGroupButton({ productId, vendorId }: CreateGroupButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: '',
    description: '',
    targetSize: 5,
    shareDate: '',
    isPrivate: false,
    maxDistance: 50,
    productId
  });
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('product_groups')
        .insert({
          product_id: data.productId,
          name: data.name,
          description: data.description,
          target_size: data.targetSize,
          current_size: 1,
          status: 'forming',
          is_private: data.isPrivate,
          max_distance_km: data.maxDistance,
          created_by: user.id,
          share_date: new Date(data.shareDate).toISOString()
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          status: 'active'
        });

      if (memberError) throw memberError;

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productGroups'] });
      setShowModal(false);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroupMutation.mutate(formData);
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="flex items-center"
      >
        <Users className="h-4 w-4 mr-2" />
        Create Group
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Create Group Buy</h2>

            {error && (
              <div className="mb-4 bg-danger-50 border border-danger-200 text-danger-600 rounded-md p-4 text-sm">
                {error}
              </div>
            )}

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Target Size
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
                    Share Date
                  </label>
                  <input
                    type="date"
                    value={formData.shareDate}
                    onChange={(e) => setFormData({ ...formData, shareDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Distance (km)
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-1" />
                    Make this group private (invite only)
                  </div>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
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
        </div>
      )}
    </>
  );
}