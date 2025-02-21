import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Package2, Users, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { PaystackButton } from '../checkout/PaystackButton';

interface GroupOrderFormProps {
  groupId: string;
  productId: string;
  price: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function GroupOrderForm({ groupId, productId, price, onSuccess, onClose }: GroupOrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: async (paymentReference: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('group_orders')
        .insert({
          group_id: groupId,
          product_id: productId,
          user_id: user.id,
          quantity,
          total_amount: price * quantity,
          payment_reference: paymentReference,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    }
  });

  const handlePaymentSuccess = (reference: string) => {
    createOrderMutation.mutate(reference);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Place Group Order</h2>

      {error && (
        <div className="mb-4 bg-danger-50 border border-danger-200 text-danger-600 rounded-md p-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <div className="mt-1">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Price per unit</span>
            <span>₦{price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Quantity</span>
            <span>{quantity}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <span>Total</span>
              <span>₦{(price * quantity).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <PaystackButton
          amount={price * quantity}
          email="user@example.com" // Replace with actual user email
          onSuccess={handlePaymentSuccess}
          onClose={() => {}}
          className="w-full"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Pay Now
        </PaystackButton>

        <Button
          variant="outline"
          onClick={onClose}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}