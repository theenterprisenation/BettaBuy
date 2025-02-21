import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface BankDetailsChangeRequestProps {
  vendorId: string;
  onClose: () => void;
}

export function BankDetailsChangeRequest({ vendorId, onClose }: BankDetailsChangeRequestProps) {
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    reason: ''
  });
  const [error, setError] = useState<string | null>(null);

  const submitRequestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('bank_detail_change_requests')
        .insert({
          vendor_id: vendorId,
          new_account_name: data.accountName,
          new_bank_name: data.bankName,
          new_account_number: data.accountNumber,
          reason: data.reason,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRequestMutation.mutate(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <Building2 className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Request Bank Details Change</h2>
      </div>

      <div className="bg-warning-50 border border-warning-200 rounded-md p-4 mb-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-warning-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-warning-800">
              Important Security Notice
            </h3>
            <div className="mt-2 text-sm text-warning-700">
              <p>For your security, bank detail changes require admin approval. This helps protect your account from unauthorized changes.</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-danger-50 border border-danger-200 text-danger-600 rounded-md p-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Name
          </label>
          <input
            type="text"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bank Name
          </label>
          <input
            type="text"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Number
          </label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
            pattern="[0-9]{10}"
            title="Please enter a valid 10-digit account number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason for Change
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
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
            disabled={submitRequestMutation.isPending}
          >
            {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  );
}