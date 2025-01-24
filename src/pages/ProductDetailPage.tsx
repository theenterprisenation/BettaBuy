import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Clock, ShoppingCart, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../hooks/useProduct';
import { useCart } from '../contexts/CartContext';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { product, loading, error } = useProduct(id!);
  const [quantity, setQuantity] = useState(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Product not found</h3>
          <p className="mt-1 text-gray-600">Please check the URL and try again</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/products')}
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    addItem(product, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
          {product.vendors.is_verified && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
              Verified Vendor
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mt-8 lg:mt-0">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="mt-3">
            <p className="text-xl font-semibold text-emerald-600">${product.price} per unit</p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Vendor Information</h2>
            <div className="mt-2 space-y-3">
              <p className="text-gray-600">{product.vendors.business_name}</p>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                {product.city}, {product.state}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Group Buy Details</h2>
            <div className="mt-2 space-y-3">
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2" />
                <span>{product.available_slots} slots remaining</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Minimum {product.minimum_slots} slots needed</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span>Ends on {new Date(product.purchase_window_end).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center space-x-4">
              <div className="w-32">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                >
                  {[...Array(Math.min(5, product.available_slots))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                className="flex-1 flex items-center justify-center"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            <div className="mt-2 prose prose-emerald">
              <p className="text-gray-600">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}