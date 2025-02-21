import React from 'react';

interface VendorTermsSection {
  title: string;
  content: string | string[];
}

export function VendorTermsPage() {
  const vendorTermsSections: VendorTermsSection[] = [
    {
      title: "Vendor Eligibility",
      content: [
        "To become a vendor on Foodrient, you must meet the following requirements:",
        "• Be a registered business entity or an individual operating legally in Nigeria.",
        "• Provide valid identification and business documentation, including but not limited to:",
        "  - Certificate of Incorporation (for businesses).",
        "  - Tax Identification Number (TIN).",
        "  - Valid government-issued ID (for individuals).",
        "• Maintain proper food handling understanding and comply with all relevant health and safety regulations.",
        "• Demonstrate the ability to fulfill bulk orders consistently and meet delivery timelines.",
        "Foodrient reserves the right to verify your eligibility and may request additional documentation at any time."
      ]
    },
    {
      title: "Platform Fees and Pricing",
      content: [
        "• Platform Fee: Foodrient charges a 5% platform fee on each successful transaction. Vendors receive 95% of the payment amount.",
        "• Pricing: Vendors must factor the 5% platform fee into their base pricing to ensure transparency and avoid high costs, as our goal is to offer market competitive prices.",
        "• Payment Processing: All payments are processed securely through Paystack. Vendors will receive payments directly into their designated bank accounts, subject to the agreed payment schedule.",
        "• Taxes: Vendors are responsible for complying with all applicable tax laws in Nigeria, including Value Added Tax (VAT) and income tax."
      ]
    },
    {
      title: "Product Quality Standards",
      content: [
        "Vendors must adhere to the following quality standards:",
        "• Food Safety: All products must comply with Nigerian food safety standards, including those set by the National Agency for Food and Drug Administration and Control (NAFDAC) and other relevant authorities.",
        "• Labeling: Manufactured Food Products must be clearly labeled with ingredients, nutritional information, expiration dates, and any allergen warnings.",
        "• Storage and Handling: Proper storage and handling procedures must be followed to ensure product quality and safety.",
        "• Quality Audits: Foodrient may conduct regular quality audits to ensure compliance with these standards. Vendors must cooperate fully with such audits."
      ]
    },
    {
      title: "Delivery and Fulfillment",
      content: [
        "Vendors are responsible for ensuring timely and safe delivery of products. The following terms apply:",
        "• On-Time Delivery Rate: Vendors must maintain a 95% on-time delivery rate. Failure to meet this standard may result in penalties or account suspension.",
        "• Packaging: Products must be packaged securely to prevent damage and ensure food safety during transport.",
        "• Delivery Schedules: Vendors must communicate delivery schedules clearly to customers and Foodrient.",
        "• Cold Chain Compliance: For perishable items, vendors must comply with cold chain requirements to maintain product quality."
      ]
    },
    {
      title: "Cancellation and Refunds",
      content: [
        "• Cancellations: Vendors must provide 24-hour notice for order cancellations. Failure to do so may result in penalties.",
        "• Refunds: Vendors must adhere to Foodrient's refund policy, which includes:",
        "  - Full refunds for quality issues or customer dissatisfaction.",
        "  - Clear documentation of refund processes and timelines.",
        "  - Cooperation with Foodrient's dispute resolution procedures.",
        "• Dispute Resolution: In the event of a dispute, vendors must work with Foodrient to resolve the issue promptly and fairly."
      ]
    },
    {
      title: "Account Suspension and Termination",
      content: [
        "Foodrient reserves the right to suspend or terminate vendor accounts for the following reasons:",
        "• Repeated failure to meet quality standards or delivery timelines.",
        "• Violation of Foodrient's policies or terms and conditions.",
        "• Multiple customer complaints or negative reviews.",
        "• Engagement in fraudulent activities or misrepresentation of products.",
        "• Non-compliance with Nigerian laws and regulations.",
        "In such cases, Foodrient will provide written notice and an opportunity to address the issue before taking action."
      ]
    },
    {
      title: "Insurance and Liability",
      content: [
        "• Business Insurance: Vendors must maintain appropriate business insurance, including liability coverage for food safety incidents.",
        "• Compliance: Vendors must comply with all local regulations related to food safety, business operations, and insurance.",
        "• Indemnification: Vendors agree to indemnify and hold Foodrient harmless from any third-party claims arising from their products or services."
      ]
    },
    {
      title: "Data Protection",
      content: [
        "Vendors must comply with the Nigeria Data Protection Regulation (NDPR) and the following requirements:",
        "• Secure Handling of Customer Information: Vendors must protect customer data and use it only for the purposes of fulfilling orders.",
        "• Confidentiality: Vendors must maintain the confidentiality of customer information and not share it with third parties without consent.",
        "• Data Breach Notification: In the event of a data breach, vendors must notify Foodrient immediately and take steps to mitigate the impact."
      ]
    },
    {
      title: "Amendments to Terms",
      content: "Foodrient reserves the right to modify these Vendor Terms and Conditions at any time. Changes will be effective immediately upon posting on the platform. Vendors are responsible for reviewing the Terms periodically to stay informed of updates."
    },
    {
      title: "Governing Law",
      content: "These Vendor Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms shall be resolved in accordance with Nigerian law, and parties agree to submit to the jurisdiction of Nigerian courts."
    },
    {
      title: "Contact Us",
      content: [
        "For questions or concerns regarding these Vendor Terms and Conditions, please contact us at:",
        "Email: support@foodrient.com",
        "Phone: 0808 056 2857"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Terms and Conditions</h1>
        <p className="mt-2 text-sm text-gray-600">Last Updated: February 2025</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
          {vendorTermsSections.map((section, index) => (
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
        <p>By registering as a vendor on Foodrient, you acknowledge that you have read, understood, and agreed to these Vendor Terms and Conditions. Thank you for partnering with Foodrient to deliver quality products and services to our customers!</p>
      </div>
    </div>
  );
}