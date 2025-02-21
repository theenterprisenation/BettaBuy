import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Mail, Send } from 'lucide-react';
import { Button } from '../ui/Button';

interface GroupInviteModalProps {
  groupId: string;
  onClose: () => void;
}

export function GroupInviteModal({ groupId, onClose }: GroupInviteModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      // First get user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) throw new Error('User not found');

      // Create invite
      const { error: inviteError } = await supabase
        .from('group_invites')
        .insert({
          group_id: groupId,
          invited_user_id: userData.id,
          status: 'pending'
        });

      if (inviteError) throw inviteError;
    },
    onSuccess: () => {
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(email);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Invite to Group</h2>

      {error && (
        <div className="mb-4 bg-danger-50 border border-danger-200 text-danger-600 rounded-md p-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={inviteMutation.isPending}
          >
            <Send className="h-4 w-4 mr-2" />
            {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
          </Button>
        </div>
      </form>
    </div>
  );
}