import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { GroupInviteModal } from './GroupInviteModal';
import { GroupDiscussion } from './GroupDiscussion';

interface GroupManagementProps {
  groupId: string;
}

export function GroupManagement({ groupId }: GroupManagementProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_groups')
        .select(`
          *,
          product:products(name, price, image_url),
          members:group_members(
            user_id,
            status,
            users(full_name, email)
          )
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    }
  });

  if (!group) return null;

  return (
    <div className="space-y-8">
      {/* Group Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
            <p className="text-gray-500 mt-1">{group.product.name}</p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Members ({group.members.length}/{group.target_size})</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 rounded-full h-2 transition-all"
              style={{ width: `${(group.members.length / group.target_size) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Members</h3>
        <div className="space-y-4">
          {group.members.map((member: any) => (
            <div
              key={member.user_id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {member.users.full_name}
                  </p>
                  <p className="text-sm text-gray-500">{member.users.email}</p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeMemberMutation.mutate(member.user_id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Group Discussion */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Group Discussion
        </h3>
        <GroupDiscussion groupId={groupId} />
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <GroupInviteModal
              groupId={groupId}
              onClose={() => setShowInviteModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}