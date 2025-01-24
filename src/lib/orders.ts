import { supabase } from './supabase';
import type { OrderDetails } from '../types';

export async function createOrder(orderDetails: OrderDetails) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userData.user.id,
        product_id: orderDetails.productId,
        quantity: orderDetails.quantity,
        total_amount: orderDetails.totalAmount,
        status: 'pending',
        payment_status: 'pending',
        payment_reference: orderDetails.paymentReference,
        delivery_option: orderDetails.delivery.option,
        delivery_details: orderDetails.delivery,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create order');
  }
}

export async function updateOrderPaymentStatus(orderId: string, status: 'success' | 'failed') {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: status,
        status: status === 'success' ? 'confirmed' : 'cancelled'
      })
      .eq('id', orderId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update payment status');
  }
}

export async function getUserOrders() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          name,
          price,
          image_url,
          is_perishable,
          vendors (
            business_name,
            address,
            latitude,
            longitude
          )
        )
      `)
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch orders');
  }
}

export async function getVendorOrders(vendorId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          name,
          price,
          image_url,
          is_perishable
        ),
        users (
          full_name,
          email,
          address
        )
      `)
      .eq('products.vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch vendor orders');
  }
}