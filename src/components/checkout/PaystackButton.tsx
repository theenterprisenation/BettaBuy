import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { Button } from '../ui/Button';
import { CreditCard } from 'lucide-react';

interface PaystackButtonProps {
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  disabled?: boolean;
  loading?: boolean;
  subaccountCode?: string; // Add subaccount code prop
}

export function PaystackButton({
  amount,
  email,
  onSuccess,
  onClose,
  disabled,
  loading,
  subaccountCode
}: PaystackButtonProps) {
  const config = {
    reference: new Date().getTime().toString(),
    email,
    amount: Math.round(amount * 100), // Convert to kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    currency: 'NGN',
    ...(subaccountCode && {
      split: {
        type: "percentage",
        subaccounts: [
          {
            subaccount: subaccountCode,
            share: 95 // Vendor gets 95% of the payment
          }
        ]
      }
    })
  };

  const initializePayment = usePaystackPayment(config);

  const handleSuccess = (response: { reference: string }) => {
    onSuccess(response.reference);
  };

  return (
    <Button
      onClick={() => {
        initializePayment(handleSuccess, onClose);
      }}
      disabled={disabled || loading}
      className="w-full"
    >
      {loading ? (
        <div className="flex items-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Processing...
        </div>
      ) : (
        <>
          <CreditCard className="h-5 w-5 mr-2" />
          Pay with Paystack
        </>
      )}
    </Button>
  );
}