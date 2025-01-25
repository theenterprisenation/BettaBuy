import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { uploadVendorImage } from '../../lib/storage';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string | null;
  folder: string;
  accept?: string;
}

export function ImageUpload({ onUpload, currentImage, folder, accept = 'image/*' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }

      setUploading(true);
      const url = await uploadVendorImage(file, folder);
      onUpload(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          {currentImage ? (
            <div className="relative">
              <img
                src={currentImage}
                alt="Preview"
                className="mx-auto h-32 w-32 object-cover rounded-lg"
              />
              <button
                onClick={() => onUpload('')}
                className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ) : (
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
              <span>Upload a file</span>
              <input
                type="file"
                className="sr-only"
                onChange={handleUpload}
                accept={accept}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
          {uploading && (
            <div className="mt-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          )}
          {error && (
            <p className="mt-2 text-sm text-danger-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}