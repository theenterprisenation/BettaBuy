import React from 'react';

interface PrivacySection {
  title: string;
  content: string | string[];
}

export function PrivacyPage() {
  const privacySections: PrivacySection[] = [
    {
      title: "Introduction",
      content: 'Foodrient ("we," "us," "our") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, store, and protect your data in compliance with the Nigeria Data Protection Regulation (NDPR) and global best practices. By using our platform, you consent to the practices described in this policy.'
    },
    {
      title: "Information We Collect",
      content: [
        "We collect and process the following types of personal information to provide and improve our services:",
        "• Personal Identification Information: Name, email address, phone number, and other contact details.",
        "• Delivery Information: Delivery address, preferences, and location data.",
        "• Payment Information: Payment details (e.g., card information, bank account details) processed through secure payment gateways.",
        "• Usage Data: Information about how you interact with our platform, including IP address, device information, browsing behavior, and preferences.",
        "• Other Information: Any additional information you voluntarily provide, such as feedback or survey responses."
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        "We use your personal information for the following purposes:",
        "• Order Processing and Fulfillment: To process and fulfill your orders, including group buying transactions, delivery, and payment processing.",
        "• Communication: To send you updates about your orders, group buys, delivery status, and promotional offers (with your consent).",
        "• Service Improvement: To analyze usage patterns, improve our platform, and develop new features.",
        "• Legal Compliance: To comply with applicable laws, regulations, and legal processes.",
        "• Customer Support: To respond to your inquiries, resolve issues, and provide support."
      ]
    },
    {
      title: "Data Protection and Security",
      content: [
        "We are committed to safeguarding your personal information and have implemented robust security measures to protect it. These measures include:",
        "• Encryption: All sensitive data, including payment information, is encrypted during transmission and storage.",
        "• Access Controls: Access to your personal information is restricted to authorized personnel only.",
        "• Regular Audits: We conduct regular security audits to ensure compliance with the NDPR and global data protection standards.",
        "• Third-Party Partners: We work with trusted third-party service providers who adhere to strict data protection protocols."
      ]
    },
    {
      title: "Your Rights Under the NDPR",
      content: [
        "In accordance with the Nigeria Data Protection Regulation (NDPR), you have the following rights regarding your personal data:",
        "• Right to Access: You can request a copy of the personal data we hold about you.",
        "• Right to Correction: You can request that we correct any inaccurate or incomplete data.",
        "• Right to Deletion: You can request the deletion of your personal data, subject to legal and contractual obligations.",
        "• Right to Object: You can object to the processing of your data for specific purposes, such as marketing.",
        "• Right to Data Portability: You can request that we transfer your data to another service provider in a structured, commonly used format.",
        "To exercise any of these rights, please contact us using the information in our contact section/page."
      ]
    },
    {
      title: "Data Retention",
      content: "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law."
    },
    {
      title: "Sharing of Information",
      content: [
        "We do not sell, trade, or rent your personal information to third parties. However, we may share your data with:",
        "• Service Providers: Trusted partners who assist us in delivering our services (e.g., payment processors, delivery partners).",
        "• Legal Authorities: When required by law or to protect our rights, property, or safety.",
        "• Business Transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred to the new entity."
      ]
    },
    {
      title: "International Data Transfers",
      content: "If your data is transferred outside Nigeria, we ensure that it is protected by adequate safeguards, such as standard contractual clauses or compliance with international data protection standards."
    },
    {
      title: "Children's Privacy",
      content: "Our platform is not intended for individuals under the age of 18. We do not knowingly collect or process personal information from minors. If we become aware of such data, we will take steps to delete it promptly."
    },
    {
      title: "Changes to This Privacy Policy",
      content: 'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The updated policy will be posted on our platform with the revised "Last Updated" date. We encourage you to review this policy periodically.'
    },
    {
      title: "Contact Us",
      content: [
        "If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at:",
        "Email: support@foodrient.com",
        "Phone: 0808 056 2857"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-600">Last Updated: February 2025</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
          {privacySections.map((section, index) => (
            <section key={index} className="border-b border-gray-200 last:border-0 pb-8 last:pb-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {index + 1}. {section.title}
              </h2>
              {Array.isArray(section.content) ? (
                <div className="space-y-2 text-gray-600">
                  {section.content.map((paragraph, i) => (
                    <p key={i} className="leading-relaxed">
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
        <p>Thank you for trusting Foodrient with your personal information. We are dedicated to protecting your privacy and providing a secure and seamless experience on our platform.</p>
      </div>
    </div>
  );
}