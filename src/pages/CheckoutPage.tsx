import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createOrder, updateOrderPaymentStatus } from '../lib/orders';
import { DeliveryOptions } from '../components/checkout/DeliveryOptions';
import { PaystackButton } from '../components/checkout/PaystackButton';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { ShoppingCart, ArrowLeft, AlertCircle } from 'lucide-react';
import type { Product, DeliveryOption, DeliveryDetails } from '../types';

interface CheckoutState {
  product: Product;
  quantity: number;
}

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get checkout data from location state
  const checkoutData = location.state as CheckoutState;
  
  if (!checkoutData) {
    navigate('/products');
    return null;
  }
  
  const { product, quantity } = checkoutData;

  const createOrderMutation = useMutation({
    mutationFn: async (paymentReference: string) => {
      if (!deliveryDetails) throw new Error('Please select a delivery option');
      
      const totalAmount = calculateTotalAmount();
      
      return createOrder({
        productId: product.id,
        quantity,
        totalAmount,
        delivery: deliveryDetails,
        paymentReference
      });
    },
    onSuccess: (data) => {
      // Update order payment status
      updateOrderPaymentStatus(data.id, 'success')
        .then(() => {
          navigate('/dashboard');
        })
        .catch((error) => {
          setError('Payment was successful but there was an error updating the order. Please contact support.');
          console.error('Error updating order status:', error);
        });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'An error occurred during checkout');
      setPaymentProcessing(false);
    }
  });

  const calculateTotalAmount = () => {
    let total = product.price * quantity;
    
    if (deliveryDetails?.option === 'delivery' && 'cost' in deliveryDetails) {
      total += deliveryDetails.cost;
    }
    
    return total;
  };

  const handleDeliveryOptionSelect = (option: DeliveryOption, details: any) => {
    setDeliveryDetails({ option, ...details });
    setError(null);
  };

  const handlePaymentSuccess = (reference: string) => {
    setPaymentProcessing(true);
    setError(null);
    createOrderMutation.mutate(reference);
  };

  const handlePaymentClose = () => {
    setError('Payment was cancelled. Please try again.');
    setPaymentProcessing(false);
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Product
      </button>

      {error && (
        <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-danger-400 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            <div className="flex items-start space-x-4">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <p className="text-gray-600">{product.vendors.business_name}</p>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Quantity: {quantity}</p>
                  <p className="text-sm text-gray-500">Price per unit: ₦{product.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <DeliveryOptions
              product={product}
              vendor={product.vendors}
              onSelect={handleDeliveryOptionSelect}
              userAddress={user?.address}
            />
          </div>
        </div>

        {/* Order Total */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Total</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({quantity} items)</span>
                <span>₦{(product.price * quantity).toLocaleString()}</span>
              </div>
              
              {deliveryDetails?.option === 'delivery' && 'cost' in deliveryDetails && (
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₦{deliveryDetails.cost.toLocaleString()}</span>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₦{calculateTotalAmount().toLocaleString()}</span>
                </div>
              </div>

              {user && (
                <PaystackButton
                  amount={calculateTotalAmount()}
                  email={user.email}
                  onSuccess={handlePaymentSuccess}
                  onClose={handlePaymentClose}
                  disabled={!deliveryDetails || createOrderMutation.isPending}
                  loading={paymentProcessing}
                />
              )}

              {!deliveryDetails && (
                <p className="text-sm text-center text-gray-500 mt-2">
                  Please select a delivery option to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}