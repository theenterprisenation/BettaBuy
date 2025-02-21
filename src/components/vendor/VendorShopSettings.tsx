import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Palette, Upload, Phone } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImageUpload } from '../shared/ImageUpload';

interface VendorShopSettingsProps {
  vendorId: string;
  currentTheme?: 'modern' | 'classic';
  currentLogo?: string;
  currentPhone?: string;
  onClose: () => void;
}

export function VendorShopSettings({ 
  vendorId, 
  currentTheme = 'modern', 
  currentLogo, 
  currentPhone,
  onClose 
}: VendorShopSettingsProps) {
  const [theme, setTheme] = useState(currentTheme);
  const [logo, setLogo] = useState(currentLogo);
  const [phone, setPhone] = useState(currentPhone || '');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const updateShopMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('vendors')
        .update({
          shop_theme: theme,
          logo_url: logo,
          phone_number: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to update shop settings');
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Shop Settings</h2>

      {error && (
        <div className="mb-4 bg-danger-50 border border-danger-200 text-danger-600 rounded-md p-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enter your business contact number
          </p>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Logo
          </label>
          <ImageUpload
            onUpload={(url) => setLogo(url)}
            currentImage={logo}
            folder="vendor-logos"
            accept="image/*"
          />
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Theme
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTheme('modern')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                theme === 'modern'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-200'
              }`}
            >
              <Palette className="h-6 w-6 text-primary-500 mb-2" />
              <h3 className="font-medium text-gray-900">Modern</h3>
              <p className="text-sm text-gray-500">Clean and minimalist design</p>
            </button>

            <button
              type="button"
              onClick={() => setTheme('classic')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                theme === 'classic'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-200'
              }`}
            >
              <Palette className="h-6 w-6 text-primary-500 mb-2" />
              <h3 className="font-medium text-gray-900">Classic</h3>
              <p className="text-sm text-gray-500">Traditional marketplace look</p>
            </button>
          </div>
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
            onClick={() => updateShopMutation.mutate()}
            disabled={updateShopMutation.isPending}
          >
            {updateShopMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}