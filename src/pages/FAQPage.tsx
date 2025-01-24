import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

export function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const { content, loading } = useContent();

  const faqs = content.faq_content?.value || [
    {
      question: 'What is group buying?',
      answer: 'Group buying is a purchasing strategy where multiple buyers come together to buy products in bulk, allowing them to access better prices and deals than they could get individually.'
    },
    {
      question: 'How does payment work?',
      answer: 'Payment is required 2 days before the product sharing day. We accept various payment methods including bank transfers and cards. All payments are secured and processed through our trusted payment partners.'
    },
    {
      question: 'What happens if the minimum group size isn\'t reached?',
      answer: 'If a group buy doesn\'t reach its minimum size by the deadline, all participants will be notified and any payments made will be fully refunded within 3-5 business days.'
    },
    {
      question: 'How is delivery handled?',
      answer: 'We offer three delivery options: Pickup from designated locations, Door-step delivery, and Stockpiling (for non-perishable items only). Delivery fees vary based on location and option chosen.'
    },
    {
      question: 'What is your refund policy?',
      answer: 'We offer full refunds if: the group buy doesn\'t meet minimum requirements, the vendor cancels the order, or if you cancel at least 3 days before the purchase window closes.'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-gray-600">
          Find answers to common questions about Foodrient's group buying platform.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between px-4 py-4 bg-white hover:bg-gray-50 focus:outline-none"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="text-left font-medium text-gray-900">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}