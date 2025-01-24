import { supabase } from './supabase';

export async function getVendorByUserId() {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createVendor(vendorData: {
  business_name: string;
  description: string;
  address: string;
  state: string;
  city: string;
  logo_url?: string;
}) {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('vendors')
    .insert({
      ...vendorData,
      user_id: userData.user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}