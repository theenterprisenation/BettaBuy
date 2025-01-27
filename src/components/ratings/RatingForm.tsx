import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Truck, Package, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface RatingFormProps {
  orderId: string;
  vendorId: string;
  onClose: () => void;
}

export function RatingForm({ orderId, vendorId, onClose }: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('vendor_ratings')
        .insert({
          vendor_id: vendorId,
          order_id: orderId,
          user_id: user.id,
          rating,
          delivery_rating: deliveryRating,
          quality_rating: qualityRating,
          communication_rating: communicationRating,
          feedback
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorRatings'] });
      onClose();
    }
  });

  const StarRating = ({ value, onChange, hover }: { 
    value: number;
    onChange: (rating: number) => void;
    hover?: boolean;
  }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => hover && setHoveredStar(star)}
          onMouseLeave={() => hover && setHoveredStar(0)}
          className="p-1"
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hover ? hoveredStar || value : value)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg max-w-lg w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating
          </label>
          <StarRating value={rating} onChange={setRating} hover />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Truck className="w-4 h-4 inline mr-2" />
            Delivery Experience
          </label>
          <StarRating value={deliveryRating} onChange={setDeliveryRating} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-2" />
            Product Quality
          </label>
          <StarRating value={qualityRating} onChange={setQualityRating} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Communication
          </label>
          <StarRating value={communicationRating} onChange={setCommunicationRating} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Share your experience..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => submitRatingMutation.mutate()}
            disabled={!rating || submitRatingMutation.isPending}
          >
            {submitRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </div>
    </div>
  );
}