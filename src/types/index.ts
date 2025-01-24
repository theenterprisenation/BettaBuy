export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  role: string;
  address?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  vendor_id: string;
  available_slots: number;
  minimum_slots: number;
  purchase_window_start: string;
  purchase_window_end: string;
  state: string;
  city: string;
  is_perishable: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  address: string;
  verified: boolean;
  latitude?: number;
  longitude?: number;
}

export type DeliveryOption = 'pickup' | 'delivery' | 'stockpiling';

export interface DeliveryDetails {
  option: DeliveryOption;
  address?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  cost?: number;
  stockpilingDays?: number;
}

export interface OrderDetails {
  productId: string;
  quantity: number;
  totalAmount: number;
  delivery: DeliveryDetails;
  paymentReference: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'success' | 'failed';
  payment_reference: string;
  delivery_option: DeliveryOption;
  delivery_details: DeliveryDetails;
  created_at: string;
  updated_at: string;
}