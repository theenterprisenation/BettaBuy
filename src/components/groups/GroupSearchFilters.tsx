import React from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

interface GroupSearchFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  locationFilter: {
    state: string;
    city: string;
  };
  setLocationFilter: (location: { state: string; city: string }) => void;
  dateRange: {
    start: string;
    end: string;
  };
  setDateRange: (range: { start: string; end: string }) => void;
  sizeFilter: {
    min: number;
    max: number;
  };
  setSizeFilter: (size: { min: number; max: number }) => void;
}

export function GroupSearchFilters({
  search,
  setSearch,
  locationFilter,
  setLocationFilter,
  dateRange,
  setDateRange,
  sizeFilter,
  setSizeFilter
}: GroupSearchFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location
          </label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="State"
              value={locationFilter.state}
              onChange={(e) => setLocationFilter({ ...locationFilter, state: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="City"
              value={locationFilter.city}
              onChange={(e) => setLocationFilter({ ...locationFilter, city: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Share Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              min={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        {/* Group Size Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="w-4 h-4 inline mr-1" />
            Group Size
          </label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min members"
              value={sizeFilter.min || ''}
              onChange={(e) => setSizeFilter({ ...sizeFilter, min: parseInt(e.target.value) || 0 })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="2"
            />
            <input
              type="number"
              placeholder="Max members"
              value={sizeFilter.max || ''}
              onChange={(e) => setSizeFilter({ ...sizeFilter, max: parseInt(e.target.value) || 0 })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min={sizeFilter.min}
            />
          </div>
        </div>
      </div>
    </div>
  );
}