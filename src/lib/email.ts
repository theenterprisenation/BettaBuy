import { supabase } from './supabase';

interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export async function sendEmail({ to, subject, body, from = 'support@foodrient.com' }: EmailConfig) {
  try {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        from,
        subject,
        html: body,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendVendorApprovalEmail(vendorEmail: string, vendorName: string, supportName: string) {
  const emailContent = getVendorApprovalEmail(vendorName, supportName);
  
  return sendEmail({
    to: vendorEmail,
    from: 'support@foodrient.com',
    subject: 'Welcome to Foodrient - Your Vendor Account is Approved! 🎉',
    body: emailContent
  });
}

export async function sendResolutionEmail(vendorEmail: string, subject: string, body: string) {
  return sendEmail({
    to: vendorEmail,
    from: 'resolutions@foodrient.com',
    subject,
    body
  });
}