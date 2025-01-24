import { supabase } from './supabase';

export async function getSiteContent() {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching site content:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSiteContent:', error);
    throw error;
  }
}

export async function updateSiteContent(id: string, value: any) {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .update({ value })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating site content:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateSiteContent:', error);
    throw error;
  }
}