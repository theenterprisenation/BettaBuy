// Add these types to your existing types/index.ts file

export interface ProductGroup {
  group_id: string;
  group_name: string;
  description?: string;
  target_size: number;
  current_size: number;
  status: 'forming' | 'complete' | 'cancelled';
  location_state: string;
  location_city: string;
  max_distance_km: number;
  share_date: string;
  distance_km: number;
}