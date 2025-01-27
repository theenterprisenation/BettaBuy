import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Upload, AlertCircle, FileText, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Papa from 'papaparse';

interface CSVRow {
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

interface BulkOrderSummary {
  recipients: CSVRow[];
  totalSets: number;
  totalAmount: number;
}

export function BulkOrderPage() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expectedRecipients, setExpectedRecipients] = useState<number>(0);
  const [summary, setSummary] = useState<BulkOrderSummary | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setCSVData([]);
    setSummary(null);

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const requiredFields = ['name', 'address'];
        const headers = Object.keys(results.data[0] || {});
        
        // Validate headers
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        if (missingFields.length > 0) {
          setError(`Missing required fields: ${missingFields.join(', ')}`);
          return;
        }

        // Validate number of recipients
        if (results.data.length !== expectedRecipients) {
          setError(`CSV contains ${results.data.length} recipients but you specified ${expectedRecipients}`);
          return;
        }

        // Validate data
        const validData = results.data as CSVRow[];
        const invalidRows = validData.filter(row => !row.name || !row.address);
        if (invalidRows.length > 0) {
          setError('Some rows are missing required data');
          return;
        }

        setCSVData(validData);
        
        // Calculate summary
        const totalSets = validData.length;
        const totalAmount = cart.items.reduce((sum, item) => {
          return sum + (item.product.price * item.quantity * totalSets);
        }, 0);

        setSummary({
          recipients: validData,
          totalSets,
          totalAmount
        });
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleProceedToCheckout = () => {
    if (!summary) return;

    // Store bulk order data in session storage
    sessionStorage.setItem('bulkOrderData', JSON.stringify(summary));
    navigate('/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Order</h1>
        <p className="mt-2 text-gray-600">
          Create multiple orders for different recipients in one go
        </p>
      </div>

      {/* Cart Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">Quantity per recipient: {item.quantity}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ₦{item.product.price * item.quantity} per set
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recipients Input */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recipients</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Recipients
            </label>
            <div className="mt-1">
              <input
                type="number"
                min="1"
                value={expectedRecipients}
                onChange={(e) => setExpectedRecipients(parseInt(e.target.value) || 0)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Recipients CSV
            </label>
            <div className="mt-1">
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-primary rounded-lg tracking-wide uppercase border border-primary cursor-pointer hover:bg-primary-50">
                  <Upload className="w-8 h-8" />
                  <span className="mt-2 text-base leading-normal">Select CSV file</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                CSV must include: name, address (optional: phone, email)
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-danger-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-danger-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-danger-800">Error</h3>
                  <div className="mt-2 text-sm text-danger-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {summary && (
            <div className="rounded-md bg-primary-50 p-4">
              <div className="flex">
                <FileText className="h-5 w-5 text-primary-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-primary-800">Order Summary</h3>
                  <div className="mt-2 text-sm text-primary-700">
                    <p>Recipients: {summary.totalSets}</p>
                    <p>Total Amount: ₦{summary.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/products')}
        >
          Continue Shopping
        </Button>
        <Button
          onClick={handleProceedToCheckout}
          disabled={!summary}
        >
          <Users className="w-4 h-4 mr-2" />
          Proceed to Checkout ({csvData.length} recipients)
        </Button>
      </div>
    </div>
  );
}