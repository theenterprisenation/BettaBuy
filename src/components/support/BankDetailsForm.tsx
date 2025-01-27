import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { AlertCircle } from 'lucide-react';

interface BankDetails {
  account_name: string;
  bank_name: string;
  account_number: string;
}

export function BankDetailsForm() {
  const [formData, setFormData] = useState<BankDetails>({
    account_name: '',
    bank_name: '',
    account_number: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const saveBankDetailsMutation = useMutation({
    mutationFn: async (data: BankDetails) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('support_bank_details')
        .upsert({
          user_id: user.id,
          ...data
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportBankDetails'] });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.account_name.trim()) {
      newErrors.account_name = 'Account name is required';
    }
    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'Bank name is required';
    }
    if (!formData.account_number.trim()) {
      newErrors.account_number = 'Account number is required';
    } else if (!/^\d{10}$/.test(formData.account_number)) {
      newErrors.account_number = 'Account number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    saveBankDetailsMutation.mutate(formData);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Bank Account Details</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="account_name" className="block text-sm font-medium text-gray-700">
            Account Name
          </label>
          <input
            type="text"
            id="account_name"
            value={formData.account_name}
            onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.account_name ? 'border-danger-500' : 'border-gray-300'
            }`}
          />
          {errors.account_name && (
            <p className="mt-1 text-sm text-danger-600">{errors.account_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
            Bank Name
          </label>
          <input
            type="text"
            id="bank_name"
            value={formData.bank_name}
            onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.bank_name ? 'border-danger-500' : 'border-gray-300'
            }`}
          />
          {errors.bank_name && (
            <p className="mt-1 text-sm text-danger-600">{errors.bank_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">
            Account Number
          </label>
          <input
            type="text"
            id="account_number"
            value={formData.account_number}
            onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.account_number ? 'border-danger-500' : 'border-gray-300'
            }`}
            maxLength={10}
          />
          {errors.account_number && (
            <p className="mt-1 text-sm text-danger-600">{errors.account_number}</p>
          )}
        </div>

        {saveBankDetailsMutation.error && (
          <div className="rounded-md bg-danger-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-danger-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-danger-800">
                  Error saving bank details
                </h3>
                <div className="mt-2 text-sm text-danger-700">
                  <p>{(saveBankDetailsMutation.error as Error).message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={saveBankDetailsMutation.isPending}
          className="w-full"
        >
          {saveBankDetailsMutation.isPending ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </div>
          ) : (
            'Save Bank Details'
          )}
        </Button>
      </form>
    </div>
  );
}