import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Users } from 'lucide-react';
import { GroupCard } from './GroupCard';
import type { ProductGroup } from '../../types';

interface GroupListProps {
  productId: string;
  userState: string;
  userCity: string;
  onJoinGroup: (group: ProductGroup) => void;
  onViewDetails: (group: ProductGroup) => void;
}

export function GroupList({
  productId,
  userState,
  userCity,
  onJoinGroup,
  onViewDetails
}: GroupListProps) {
  const { data: groups, isLoading } = useQuery({
    queryKey: ['productGroups', productId, userState, userCity],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('find_nearby_groups', {
        product_id_param: productId,
        user_state: userState,
        user_city: userCity
      });

      if (error) throw error;
      return data as ProductGroup[];
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
        <GroupCard
          key={group.group_id}
          group={group}
          onJoin={() => onJoinGroup(group)}
          onViewDetails={() => onViewDetails(group)}
        />
      ))}
    </div>
  );
}