import React from 'react';

interface TermsSection {
  title: string;
  content: string | string[];
}

export function TermsPage() {
  const termsSections: TermsSection[] = [
    {
      title: "Agreement to Terms",
      content: "By accessing or using the Foodrient platform, you agree to be bound by these Terms and Conditions (\"Terms\"). These Terms are governed by the laws of the Federal Republic of Nigeria, including but not limited to the Consumer Protection Council Act, the Nigeria Data Protection Regulation (NDPR), and other relevant legislation. If you do not agree to these Terms, you must not use our platform."
    },
    {
      title: "Eligibility",
      content: [
        "To use Foodrient, you must:",
        "• Be at least 18 years old.",
        "• Have the legal capacity to enter into a binding agreement.",
        "• Provide accurate and complete information during registration."
      ]
    },
    {
      title: "Group Buying Process",
      content: [
        "Foodrient facilitates group buying, allowing users to purchase products in bulk at discounted prices. The following terms apply:",
        "• Minimum Participant Requirements: Each group buy has a minimum number of participants required for the deal to proceed. This requirement will be clearly stated on the product page.",
        "• Payment Terms: Payment must be made 2 days before the product sharing day. We accept payments through secure methods, including bank transfers and card payments via Paystack.",
        "• Cancellations:",
        "  - Customers may cancel their participation in a group buy at least 3 days before the purchase window closes to be eligible for a refund.",
        "  - If the minimum participant requirement is not met, the group buy will be canceled, and all payments will be refunded.",
        "  - Vendors may cancel a group buy due to unforeseen circumstances. In such cases, customers will be notified, and refunds will be processed."
      ]
    },
    {
      title: "Delivery and Pickup",
      content: [
        "Foodrient offers the following delivery options:",
        "• Pickup from Designated Locations: Customers may collect their orders from specified pickup points at no additional cost.",
        "• Door-Step Delivery: Orders can be delivered directly to your address. Additional delivery fees may apply, depending on your location and the product's weight.",
        "• Stockpiling: For non-perishable items only, customers may opt to store their orders for future use.",
        "Delivery timelines and fees will be communicated during the checkout process. Foodrient is not responsible for delays caused by factors beyond our control, such as weather conditions or logistical issues."
      ]
    },
    {
      title: "Refund Policy",
      content: [
        "Refunds will be processed within 3-5 business days under the following circumstances:",
        "• The group buy does not meet the minimum participant requirement.",
        "• The vendor cancels the order.",
        "• The customer cancels their participation at least 3 days before the purchase window closes.",
        "Refunds will be issued to the original payment method used during the transaction. For assistance with refunds, please contact our support team."
      ]
    },
    {
      title: "Vendor Responsibilities",
      content: [
        "Vendors using the Foodrient platform agree to:",
        "• Provide accurate and complete information about their products, including pricing, descriptions, and availability.",
        "• Fulfill orders in a timely manner and maintain the quality of products as advertised.",
        "• Comply with all applicable laws, including food safety regulations and the NDPR.",
        "• Pay a 5% platform fee for each successful group buy, with the remaining 95% of the payment transferred to the vendor's account."
      ]
    },
    {
      title: "User Responsibilities",
      content: [
        "As a user of Foodrient, you agree to:",
        "• Provide accurate and up-to-date information during registration and transactions.",
        "• Use the platform only for lawful purposes and in compliance with these Terms.",
        "• Not engage in fraudulent activities, including but not limited to false claims, unauthorized transactions, or misuse of payment methods.",
        "• Respect the intellectual property rights of Foodrient and its vendors."
      ]
    },
    {
      title: "Dispute Resolution",
      content: [
        "In the event of a dispute, Foodrient is committed to resolving issues fairly and efficiently. The following steps will be taken:",
        "• Internal Resolution: Contact our support team at support@foodrient.com to report the issue. We will investigate and attempt to resolve the matter within 7 business days.",
        "• Mediation: If the issue remains unresolved, parties may opt for mediation through a neutral third party.",
        "• Legal Action: If mediation fails, disputes will be resolved in accordance with Nigerian law. Users have the right to file complaints with the Consumer Protection Council or seek redress through the appropriate courts in Nigeria."
      ]
    },
    {
      title: "Limitation of Liability",
      content: [
        "Foodrient shall not be liable for:",
        "• Any indirect, incidental, or consequential damages arising from the use of our platform.",
        "• Delays or failures in delivery caused by third-party logistics providers or unforeseen circumstances.",
        "• Loss or damage to products after they have been delivered to the customer or picked up from the designated location."
      ]
    },
    {
      title: "Intellectual Property",
      content: "All content on the Foodrient platform, including logos, text, graphics, and software, is the property of Foodrient or its licensors and is protected by Nigerian and international intellectual property laws. You may not use, reproduce, or distribute any content without prior written consent from Foodrient."
    },
    {
      title: "Amendments to Terms",
      content: "Foodrient reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting on the platform. Your continued use of Foodrient after any changes constitutes your acceptance of the revised Terms."
    },
    {
      title: "Governing Law",
      content: "These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any legal actions or proceedings arising out of or related to these Terms shall be brought exclusively in the courts of Nigeria."
    },
    {
      title: "Contact Us",
      content: [
        "For questions, concerns, or assistance regarding these Terms and Conditions, please contact us at:",
        "Email: support@foodrient.com",
        "Phone: 0808 056 2857"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-gray-600">Last Updated: February 2025</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
          {termsSections.map((section, index) => (
            <section key={index} className="border-b border-gray-200 last:border-0 pb-8 last:pb-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {index + 1}. {section.title}
              </h2>
              {Array.isArray(section.content) ? (
                <div className="space-y-2 text-gray-600">
                  {section.content.map((paragraph, i) => (
                    <p key={i} className="leading-relaxed whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed">{section.content}</p>
              )}
            </section>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>By using Foodrient, you acknowledge that you have read, understood, and agreed to these Terms and Conditions. Thank you for choosing Foodrient!</p>
      </div>
    </div>
  );
}