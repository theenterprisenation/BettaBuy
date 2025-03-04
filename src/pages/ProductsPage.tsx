import React, { useState, useMemo } from 'react';
import { ProductGrid } from '../components/products/ProductGrid';
import { SearchFilters } from '../components/products/SearchFilters';
import { useProducts } from '../hooks/useProducts';

export function ProductsPage() {
  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [location, setLocation] = useState({ state: '', city: '' });
  const [shareDateRange, setShareDateRange] = useState({
    start: '',
    end: ''
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply vendor search filter
    if (vendorSearch) {
      const vendorSearchLower = vendorSearch.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.vendors.business_name.toLowerCase().includes(vendorSearchLower)
      );
    }

    // Apply location filters
    if (location.state) {
      filtered = filtered.filter(
        (product) => product.state.toLowerCase().includes(location.state.toLowerCase())
      );
    }
    if (location.city) {
      filtered = filtered.filter(
        (product) => product.city.toLowerCase().includes(location.city.toLowerCase())
      );
    }

    // Apply share date range filter
    if (shareDateRange.start) {
      const startDate = new Date(shareDateRange.start);
      filtered = filtered.filter(
        (product) => new Date(product.share_date_start) >= startDate
      );
    }
    if (shareDateRange.end) {
      const endDate = new Date(shareDateRange.end);
      filtered = filtered.filter(
        (product) => new Date(product.share_date_end) <= endDate
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'slots':
        filtered.sort((a, b) => b.available_slots - a.available_slots);
        break;
      case 'ending-soon':
        filtered.sort(
          (a, b) =>
            new Date(a.purchase_window_end).getTime() -
            new Date(b.purchase_window_end).getTime()
        );
        break;
      default: // 'latest'
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return filtered;
  }, [products, search, vendorSearch, sortBy, location, shareDateRange]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Group Buy Opportunities</h1>
        <p className="mt-2 text-gray-600">Join active group purchases and save together</p>
      </div>

      <SearchFilters
        search={search}
        setSearch={setSearch}
        vendorSearch={vendorSearch}
        setVendorSearch={setVendorSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        location={location}
        setLocation={setLocation}
        shareDateRange={shareDateRange}
        setShareDateRange={setShareDateRange}
      />

      <ProductGrid products={filteredProducts} loading={loading} error={error} />
    </div>
  );
}