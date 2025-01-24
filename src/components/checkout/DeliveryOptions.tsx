import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import type { DeliveryOption, Product, Vendor } from '../../types';

interface DeliveryOptionsProps {
  product: Product;
  vendor: Vendor;
  onSelect: (option: DeliveryOption, details: any) => void;
  userAddress?: string;
}

const FUEL_COST_PER_LITER = 1200; // N1,200 per liter
const KM_PER_LITER = 10; // Assuming 10km per liter of fuel
const COST_PER_KM = FUEL_COST_PER_LITER / KM_PER_LITER;

export function DeliveryOptions({ product, vendor, onSelect, userAddress }: DeliveryOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(null);
  const [deliveryCost, setDeliveryCost] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);

  useEffect(() => {
    if (selectedOption === 'delivery' && userAddress) {
      // In a real application, use a geocoding service to get coordinates
      // For now, we'll simulate a random distance between 1-20km
      const simulatedDistance = Math.floor(Math.random() * 20) + 1;
      setDistance(simulatedDistance);
      setDeliveryCost(calculateDeliveryCost(simulatedDistance));
    }
  }, [selectedOption, userAddress]);

  const calculateDeliveryCost = (distanceInKm: number) => {
    return Math.round(distanceInKm * COST_PER_KM);
  };

  const handleOptionSelect = (option: DeliveryOption) => {
    setSelectedOption(option);
    
    switch (option) {
      case 'pickup':
        onSelect(option, { address: vendor.address });
        break;
      case 'delivery':
        onSelect(option, { 
          address: userAddress,
          cost: deliveryCost,
          distance: distance
        });
        break;
      case 'stockpiling':
        if (!product.is_perishable) {
          onSelect(option, { days: 7 });
        }
        break;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Choose Delivery Option</h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Pickup Option */}
        <button
          onClick={() => handleOptionSelect('pickup')}
          className={`p-4 border rounded-lg text-left transition-colors ${
            selectedOption === 'pickup'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-primary-500" />
            <div>
              <h4 className="font-medium text-gray-900">Pickup</h4>
              <p className="text-sm text-gray-500">Collect from vendor location</p>
            </div>
          </div>
          {selectedOption === 'pickup' && (
            <div className="mt-3 text-sm text-gray-600">
              <p className="font-medium">Pickup Address:</p>
              <p>{vendor.address}</p>
            </div>
          )}
        </button>

        {/* Delivery Option */}
        <button
          onClick={() => handleOptionSelect('delivery')}
          className={`p-4 border rounded-lg text-left transition-colors ${
            selectedOption === 'delivery'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Truck className="h-5 w-5 text-primary-500" />
            <div>
              <h4 className="font-medium text-gray-900">Delivery</h4>
              <p className="text-sm text-gray-500">Deliver to your address</p>
            </div>
          </div>
          {selectedOption === 'delivery' && deliveryCost > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              <p className="font-medium">Delivery Cost:</p>
              <p>₦{deliveryCost.toLocaleString()} ({distance}km)</p>
            </div>
          )}
        </button>

        {/* Stockpiling Option */}
        <button
          onClick={() => handleOptionSelect('stockpiling')}
          disabled={product.is_perishable}
          className={`p-4 border rounded-lg text-left transition-colors ${
            product.is_perishable
              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
              : selectedOption === 'stockpiling'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5 text-primary-500" />
            <div>
              <h4 className="font-medium text-gray-900">Stockpiling</h4>
              <p className="text-sm text-gray-500">
                {product.is_perishable
                  ? 'Not available for perishable items'
                  : '7 days storage'}
              </p>
            </div>
          </div>
          {selectedOption === 'stockpiling' && !product.is_perishable && (
            <div className="mt-3 text-sm text-gray-600">
              <p>Your items will be stored safely for up to 7 days</p>
            </div>
          )}
        </button>
      </div>

      {selectedOption === 'delivery' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
          <p className="text-sm text-gray-600 mb-4">
            Delivery cost is calculated based on distance at ₦{COST_PER_KM}/km
          </p>
          {/* In a real app, integrate with a maps service for address input and validation */}
          <input
            type="text"
            placeholder="Enter your delivery address"
            className="w-full p-2 border rounded"
            value={userAddress}
            readOnly
          />
        </div>
      )}
    </div>
  );
}