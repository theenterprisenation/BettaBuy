import React from 'react';
import { Search, SlidersHorizontal, MapPin, Store, Calendar, Filter, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface SearchFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  vendorSearch: string;
  setVendorSearch: (search: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  location: {
    state: string;
    city: string;
  };
  setLocation: (location: { state: string; city: string }) => void;
  shareDateRange: {
    start: string;
    end: string;
  };
  setShareDateRange: (range: { start: string; end: string }) => void;
}

export function SearchFilters({
  search,
  setSearch,
  vendorSearch,
  setVendorSearch,
  sortBy,
  setSortBy,
  location,
  setLocation,
  shareDateRange,
  setShareDateRange
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);

  const updateActiveFilters = () => {
    const filters: string[] = [];
    if (location.state || location.city) filters.push('location');
    if (vendorSearch) filters.push('vendor');
    if (shareDateRange.start || shareDateRange.end) filters.push('date');
    if (sortBy !== 'latest') filters.push('sort');
    setActiveFilters(filters);
  };

  React.useEffect(() => {
    updateActiveFilters();
  }, [location, vendorSearch, shareDateRange, sortBy]);

  const clearFilter = (filter: string) => {
    switch (filter) {
      case 'location':
        setLocation({ state: '', city: '' });
        break;
      case 'vendor':
        setVendorSearch('');
        break;
      case 'date':
        setShareDateRange({ start: '', end: '' });
        break;
      case 'sort':
        setSortBy('latest');
        break;
    }
  };

  const clearAllFilters = () => {
    setLocation({ state: '', city: '' });
    setVendorSearch('');
    setShareDateRange({ start: '', end: '' });
    setSortBy('latest');
    setSearch('');
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for products or vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilters.length > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full text-xs">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <button
                onClick={() => clearFilter(filter)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-sm"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Location Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="State"
                value={location.state}
                onChange={(e) => setLocation({ ...location, state: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              />
              <input
                type="text"
                placeholder="City"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Vendor Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Store className="w-4 h-4 inline mr-2" />
              Vendor
            </label>
            <input
              type="text"
              placeholder="Search by vendor name"
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
            />
          </div>

          {/* Share Date Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 inline mr-2" />
              Share Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={shareDateRange.start}
                onChange={(e) => setShareDateRange({ ...shareDateRange, start: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              />
              <input
                type="date"
                value={shareDateRange.end}
                min={shareDateRange.start}
                onChange={(e) => setShareDateRange({ ...shareDateRange, end: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <SlidersHorizontal className="w-4 h-4 inline mr-2" />
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
            >
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="slots">Available Slots</option>
              <option value="ending-soon">Ending Soon</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}