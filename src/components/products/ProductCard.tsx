import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product & {
    vendors: {
      business_name: string;
      logo_url: string | null;
      is_verified: boolean;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const remainingSlots = product.available_slots;
  const progress = ((product.minimum_slots - remainingSlots) / product.minimum_slots) * 100;
  const endDate = new Date(product.purchase_window_end);
  const timeLeft = endDate.getTime() - new Date().getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const getProgressColor = () => {
    if (progress >= 80) return 'bg-danger-500';
    if (progress >= 50) return 'bg-warning-500';
    return 'bg-primary-500';
  };

  const getTimeLeftColor = () => {
    if (daysLeft <= 2) return 'text-danger-600';
    if (daysLeft <= 5) return 'text-warning-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative h-48">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.vendors.is_verified ? (
          <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified Vendor
          </div>
        ) : (
          <div className="absolute top-2 right-2 bg-warning-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unverified Vendor
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.vendors.business_name}</p>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              {product.city}, {product.state}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary-600">${product.price}</p>
            <p className="text-sm text-gray-500">per unit</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Users className="w-4 h-4 mr-1" />
            <span>{remainingSlots} slots left</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${getProgressColor()} rounded-full h-2 transition-all`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className={`flex items-center text-sm ${getTimeLeftColor()}`}>
            <Clock className="w-4 h-4 mr-1" />
            <span>{daysLeft} days left</span>
          </div>
          <Link to={`/products/${product.id}`}>
            <Button variant="primary" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}