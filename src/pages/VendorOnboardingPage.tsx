import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Store, Upload, AlertCircle } from 'lucide-react';
import { ImageUpload } from '../components/shared/ImageUpload';

interface VendorFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessAddress: string;
  state: string;
  city: string;
  utilityBill: File | null;
  nationalId: File | null;
  termsAccepted: boolean;
  logo: File | null;
}

export function VendorOnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const [formData, setFormData] = useState<VendorFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessAddress: '',
    state: '',
    city: '',
    utilityBill: null,
    nationalId: null,
    termsAccepted: false,
    logo: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VendorFormData, string>>>({});

  const createVendorMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      // First, call the register_vendor function with referral code
      const { data: vendorData, error: vendorError } = await supabase.rpc('register_vendor', {
        vendor_email: data.email,
        vendor_password: data.password,
        business_name: data.businessName,
        description: `${data.firstName} ${data.lastName}'s Business`,
        address: data.businessAddress,
        state: data.state,
        city: data.city,
        referral_code: referralCode
      });

      if (vendorError) throw vendorError;

      // Sign in the vendor
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (signInError) throw signInError;

      return vendorData;
    },
    onSuccess: () => {
      navigate('/vendor');
    },
  });

  const validateForm = () => {
    const newErrors: Partial<Record<keyof VendorFormData, string>> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    if (!formData.businessAddress) newErrors.businessAddress = 'Business address is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.utilityBill) newErrors.utilityBill = 'Utility bill is required';
    if (!formData.nationalId) newErrors.nationalId = 'National ID is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createVendorMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'utilityBill' | 'nationalId') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <Store className="mx-auto h-12 w-12 text-primary-600" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Become a Vendor</h1>
        <p className="mt-2 text-lg text-gray-600">
          Join our platform and start selling your products to group buyers
        </p>
        <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-4 text-primary-800">
          <h3 className="font-semibold">Important Fee Information</h3>
          <p className="text-sm mt-1">
            Our platform charges a 5% fee on each successful transaction. Please factor this into your product pricing.
            You will receive 95% of each payment directly to your registered bank account.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.firstName ? 'border-danger-500' : 'border-gray-300'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-danger-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.lastName ? 'border-danger-500' : 'border-gray-300'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-danger-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.email ? 'border-danger-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-danger-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.password ? 'border-danger-500' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-danger-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.confirmPassword ? 'border-danger-500' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Business/Trade Name
          </label>
          <input
            type="text"
            id="businessName"
            value={formData.businessName}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.businessName ? 'border-danger-500' : 'border-gray-300'
            }`}
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-danger-600">{errors.businessName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Logo
          </label>
          <ImageUpload
            onUpload={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
            currentImage={formData.logo_url}
            folder="logos"
          />
        </div>

        <div>
          <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
            Business Address
          </label>
          <textarea
            id="businessAddress"
            rows={3}
            value={formData.businessAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.businessAddress ? 'border-danger-500' : 'border-gray-300'
            }`}
          />
          {errors.businessAddress && (
            <p className="mt-1 text-sm text-danger-600">{errors.businessAddress}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="state"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.state ? 'border-danger-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Lagos"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-danger-600">{errors.state}</p>
            )}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.city ? 'border-danger-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Ikeja"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-danger-600">{errors.city}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recent Utility Bill
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="utilityBill"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="utilityBill"
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'utilityBill')}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
            {errors.utilityBill && (
              <p className="mt-1 text-sm text-danger-600">{errors.utilityBill}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valid National ID
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="nationalId"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="nationalId"
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'nationalId')}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
            {errors.nationalId && (
              <p className="mt-1 text-sm text-danger-600">{errors.nationalId}</p>
            )}
          </div>
        </div>

        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I accept the
            </label>{' '}
            <a
              href="/vendor-terms"
              target="_blank"
              className="text-primary-600 hover:text-primary-500"
            >
              vendor terms and conditions
            </a>
            {errors.termsAccepted && (
              <p className="mt-1 text-sm text-danger-600">{errors.termsAccepted}</p>
            )}
          </div>
        </div>

        {createVendorMutation.error && (
          <div className="rounded-md bg-danger-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-danger-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-danger-800">
                  Error submitting application
                </h3>
                <div className="mt-2 text-sm text-danger-700">
                  <p>{createVendorMutation.error.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createVendorMutation.isPending}
            className="w-full sm:w-auto"
          >
            {createVendorMutation.isPending ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}