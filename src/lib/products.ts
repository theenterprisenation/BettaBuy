import { supabase } from './supabase';
import type { Product } from '../types';

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      vendors (
        business_name,
        logo_url,
        is_verified
      )
    `)
    .gte('purchase_window_end', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      vendors (
        business_name,
        logo_url,
        is_verified,
        address
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}