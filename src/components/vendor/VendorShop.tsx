import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Store, MapPin, Star, Package, Phone } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';

interface VendorShopProps {
  vendorId: string;
}

export function VendorShop({ vendorId }: VendorShopProps) {
  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .eq('id', vendorId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['vendorProducts', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (vendorLoading || productsLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!vendor) return null;

  const isModernTheme = vendor.shop_theme !== 'classic';

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
      isModernTheme ? 'bg-gray-50' : 'bg-white'
    }`}>
      {/* Vendor Header */}
      <div className={`mb-8 ${
        isModernTheme 
          ? 'bg-white shadow-lg rounded-lg p-6'
          : 'border-b border-gray-200 pb-6'
      }`}>
        <div className="flex items-center space-x-6">
          {vendor.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={vendor.business_name}
              className="h-24 w-24 object-cover rounded-lg"
            />
          ) : (
            <div className="h-24 w-24 bg-primary-100 rounded-lg flex items-center justify-center">
              <Store className="h-12 w-12 text-primary-600" />
            </div>
          )}
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vendor.business_name}</h1>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {vendor.city}, {vendor.state}
            </div>
            {vendor.phone_number && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Phone className="h-4 w-4 mr-1" />
                <a href={`tel:${vendor.phone_number}`} className="hover:text-primary-600">
                  {vendor.phone_number}
                </a>
              </div>
            )}
            {vendor.average_rating && (
              <div className="mt-2 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(vendor.average_rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {vendor.average_rating.toFixed(1)} ({vendor.total_ratings} reviews)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products?.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products available</h3>
          <p className="mt-1 text-sm text-gray-500">
            This vendor hasn't added any products yet.
          </p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${
          isModernTheme ? '' : 'border-t border-gray-200 pt-8'
        }`}>
          {products?.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                vendors: {
                  business_name: vendor.business_name,
                  logo_url: vendor.logo_url,
                  is_verified: vendor.is_verified,
                  average_rating: vendor.average_rating,
                  total_ratings: vendor.total_ratings
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}