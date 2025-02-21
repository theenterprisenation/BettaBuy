import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Users, MapPin, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

interface Group {
  id: string;
  name: string;
  description: string;
  target_size: number;
  current_size: number;
  status: 'forming' | 'complete' | 'cancelled';
  is_private: boolean;
  location_state: string;
  location_city: string;
  share_date: string;
  created_by: {
    full_name: string;
  };
  product: {
    name: string;
    price: number;
    image_url: string;
  };
}

interface GroupListProps {
  userState: string;
  userCity: string;
  onJoinGroup: (group: Group) => void;
}

export function GroupList({ userState, userCity, onJoinGroup }: GroupListProps) {
  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups', userState, userCity],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_groups')
        .select(`
          *,
          created_by:users!created_by(full_name),
          product:products!product_id(name, price, image_url)
        `)
        .eq('status', 'forming')
        .eq('is_private', false)
        .or(`location_state.eq.${userState},location_city.eq.${userCity}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Group[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!groups?.length) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Be the first to create a group in your area
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-48">
            <img
              src={group.product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
              alt={group.product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="text-lg font-semibold text-white">{group.name}</h3>
              <p className="text-sm text-white/90">{group.product.name}</p>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {group.location_city}, {group.location_state}
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Calendar className="h-4 w-4 mr-1" />
              Share Date: {new Date(group.share_date).toLocaleDateString()}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{group.current_size}/{group.target_size} members</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 rounded-full h-2 transition-all"
                  style={{ width: `${(group.current_size / group.target_size) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Created by {group.created_by.full_name}
              </div>
              <Button
                onClick={() => onJoinGroup(group)}
                disabled={group.current_size >= group.target_size}
              >
                Join Group
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}