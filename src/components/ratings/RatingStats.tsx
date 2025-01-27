import React from 'react';
import { Star } from 'lucide-react';

interface RatingStatsProps {
  averageRating: number;
  totalRatings: number;
  distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  averageDelivery: number;
  averageQuality: number;
  averageCommunication: number;
}

export function RatingStats({
  averageRating,
  totalRatings,
  distribution,
  averageDelivery,
  averageQuality,
  averageCommunication
}: RatingStatsProps) {
  const getPercentage = (count: number) => {
    return totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</h3>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">{totalRatings} ratings</p>
        </div>

        <div className="flex-1 ml-8">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center mb-2">
              <span className="text-sm text-gray-600 w-8">{star}</span>
              <div className="flex-1 mx-3">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{ width: `${getPercentage(distribution[star as keyof typeof distribution])}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-500 w-12">
                {getPercentage(distribution[star as keyof typeof distribution])}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t pt-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Delivery</h4>
          <div className="flex items-center mt-1">
            <span className="text-lg font-semibold text-gray-900 mr-2">
              {averageDelivery.toFixed(1)}
            </span>
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900">Quality</h4>
          <div className="flex items-center mt-1">
            <span className="text-lg font-semibold text-gray-900 mr-2">
              {averageQuality.toFixed(1)}
            </span>
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900">Communication</h4>
          <div className="flex items-center mt-1">
            <span className="text-lg font-semibold text-gray-900 mr-2">
              {averageCommunication.toFixed(1)}
            </span>
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
        </div>
      </div>
    </div>
  );
}