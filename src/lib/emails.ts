export function getVendorApprovalEmail(vendorName: string, supportName: string) {
  return `
Subject: Welcome to Foodrient - Your Vendor Account is Approved! 🎉

Dear ${vendorName},

Congratulations! Your vendor application for Foodrient has been approved. We're excited to welcome you to our platform where we connect vendors with customers through group buying opportunities.

Important Information:

1. Your Dedicated Support
   - You have been assigned ${supportName} as your dedicated support representative
   - They will assist you with any questions and help you maximize your success on our platform
   - You can reach them at support@foodrient.com

2. Platform Fees & Pricing
   - Our platform charges a 5% fee on each successful transaction
   - You will receive 95% of each payment directly to your registered bank account
   - Please factor this 5% platform fee into your product pricing to maintain your desired margins

3. Group Buying Focus
   - Foodrient is specifically designed for bulk purchases at discounted prices
   - We expect vendors to offer meaningful discounts for bulk orders
   - Your prices should reflect the cost savings of bulk purchasing
   - Regular retail prices are not suitable for our platform

4. Legal & Compliance
   IMPORTANT: Please note that fraudulent activities will not be tolerated:
   - Collecting payment without fulfilling orders is considered criminal fraud
   - Foodrient maintains a zero-tolerance policy for fraudulent activities
   - We will pursue legal action against any vendor engaging in fraudulent practices
   - We cooperate fully with law enforcement in cases of fraud

5. Next Steps
   - Log in to your vendor dashboard at https://foodrient.com/auth
   - Complete your bank account details for payments
   - Start listing your products with bulk pricing
   - Ensure your product descriptions and images are clear and accurate

Best Practices:
- Set competitive bulk prices that offer real value to customers
- Maintain accurate inventory levels
- Respond promptly to customer inquiries
- Fulfill orders on time and as described
- Communicate any potential delays immediately

For any questions or assistance, please contact your dedicated support representative or email support@foodrient.com.

Welcome aboard!

Best regards,
The Foodrient Team

---
Foodrient.com - Buy Together, Save Together
This is an automated message. Please do not reply directly to this email.
`;
}