import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, X, Users } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/Button';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
  const { cart, removeItem, updateQuantity, totalAmount } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  const handleBulkOrder = () => {
    navigate('/bulk-order');
    onClose();
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ShoppingCart className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">Your cart is empty</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/bulk-order')}
                className="flex items-center justify-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Create Bulk Order
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              {cart.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center py-4 border-b border-gray-200 last:border-0"
                >
                  <img
                    src={item.product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ${item.product.price} × {item.quantity}
                    </p>
                    <div className="mt-1 flex items-center">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.product.id, parseInt(e.target.value))
                        }
                        className="text-sm border rounded-md mr-2"
                      >
                        {[...Array(5)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-danger-500 hover:text-danger-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-3">
                <p>Total</p>
                <p>${totalAmount.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={handleBulkOrder}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Create Bulk Order
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Need to order for multiple recipients? Try our bulk order feature!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}