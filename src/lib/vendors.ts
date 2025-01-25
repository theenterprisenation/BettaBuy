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

async function createPaystackSubaccount(bankDetails: {
  business_name: string;
  bank_code: string;
  account_number: string;
  percentage_charge: number;
}) {
  const response = await fetch('https://api.paystack.co/subaccount', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      business_name: bankDetails.business_name,
      bank_code: bankDetails.bank_code,
      account_number: bankDetails.account_number,
      percentage_charge: bankDetails.percentage_charge,
      primary_contact_email: bankDetails.email
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create Paystack subaccount');
  }

  const data = await response.json();
  return data.data.subaccount_code;
}

export async function saveBankDetails(vendorId: string, bankDetails: {
  account_name: string;
  bank_name: string;
  account_number: string;
  bank_code: string;
  email: string;
}) {
  try {
    // Get vendor details
    const { data: vendor } = await supabase
      .from('vendors')
      .select('business_name')
      .eq('id', vendorId)
      .single();

    if (!vendor) throw new Error('Vendor not found');

    // Create Paystack subaccount with welcome email
    const subaccountCode = await createPaystackSubaccount({
      business_name: vendor.business_name,
      bank_code: bankDetails.bank_code,
      account_number: bankDetails.account_number,
      percentage_charge: 95, // Vendor gets 95% of the payment
      email: bankDetails.email
    });

    // Save bank details and subaccount code
    const { error } = await supabase
      .from('vendor_bank_details')
      .upsert({
        vendor_id: vendorId,
        account_name: bankDetails.account_name,
        bank_name: bankDetails.bank_name,
        account_number: bankDetails.account_number,
        paystack_subaccount_code: subaccountCode
      });

    if (error) throw error;

    // Send welcome email with fee information
    await sendVendorWelcomeEmail(bankDetails.email);

  } catch (error) {
    console.error('Error saving bank details:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to save bank details');
  }
}

async function sendVendorWelcomeEmail(email: string) {
  // In a real application, implement email sending logic here
  console.log(`
    Sending welcome email to ${email}:
    
    Subject: Welcome to Foodrient - Important Fee Information
    
    Dear Vendor,
    
    Welcome to Foodrient! We're excited to have you on board.
    
    Important Fee Information:
    - Our platform charges a 5% fee on each successful transaction
    - You will receive 95% of each payment directly to your registered bank account
    - Please factor this 5% platform fee into your product pricing to maintain your desired margins
    
    Best regards,
    The Foodrient Team
  `);
}