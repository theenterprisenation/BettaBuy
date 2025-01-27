import React from 'react';
import { Users, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ProductGroup } from '../../types';

interface GroupCardProps {
  group: ProductGroup;
  onJoin: () => void;
  onViewDetails: () => void;
}

export function GroupCard({ group, onJoin, onViewDetails }: GroupCardProps) {
  const remainingSlots = group.target_size - group.current_size;
  const progress = (group.current_size / group.target_size) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              {group.location_city}, {group.location_state}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              {remainingSlots} slots left
            </div>
            <div className="mt-1">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 rounded-full h-2 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Calendar className="w-4 h-4 mr-1" />
          Share Date: {new Date(group.share_date).toLocaleDateString()}
        </div>

        {group.description && (
          <p className="text-sm text-gray-600 mb-4">{group.description}</p>
        )}

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex items-center"
          >
            View Details
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="sm"
            onClick={onJoin}
            disabled={remainingSlots === 0}
          >
            Join Group
          </Button>
        </div>
      </div>
    </div>
  );
}