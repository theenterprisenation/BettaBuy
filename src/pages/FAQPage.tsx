import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQSection {
  title: string;
  questions: {
    question: string;
    answer: string | string[];
  }[];
}

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const faqSections: FAQSection[] = [
    {
      title: "General Questions",
      questions: [
        {
          question: "What is Foodrient?",
          answer: "Foodrient is a platform that revolutionizes group food buying in Nigeria. By connecting buyers, we help you save money, reduce waste, and build community through collective purchasing. Join the smart food shopping revolution today!"
        },
        {
          question: "What is group buying?",
          answer: "Group buying is a purchasing strategy where multiple buyers come together to buy products in bulk. This allows everyone in the group to access better prices and deals than they could get individually."
        },
        {
          question: "How does Foodrient work?",
          answer: "You can join a group to buy food items in bulk or you can pick product randomly from multiple vendor in your location. Either ways, once the group reaches the required size, the deal is activated, and you can enjoy discounted prices. Payments are made securely, and delivery options are provided."
        }
      ]
    },
    {
      title: "Payment and Pricing",
      questions: [
        {
          question: "How does payment work?",
          answer: "Payment is required 2 days before the product sharing day. We accept various payment methods, including bank transfers and cards, through our secure payment partner, Paystack. Rest assured, your transactions are safe and encrypted."
        },
        {
          question: "Are there any additional fees?",
          answer: "For vendors, we charge a 5% platform fee, with 95% of the payment going directly to the vendor's account. As a customer, you only pay the agreed group buying price and any applicable delivery fees."
        },
        {
          question: "What happens if the minimum group size is not reached?",
          answer: "If a group buy doesn't reach its minimum size by the deadline, all participants will be notified, and any payments made will be fully refunded within 3-5 business days. Alternatively, the vendor may choose to proceed with the bulk order if they find it feasible."
        }
      ]
    },
    {
      title: "Delivery and Pickup",
      questions: [
        {
          question: "How is delivery handled?",
          answer: [
            "We offer three delivery options:",
            "• Pickup from designated locations: Collect your order from the vendor's physical shop/warehouse.",
            "• Door-step delivery: Have your order delivered directly to your address.",
            "• Stockpiling: For non-perishable items only, store your order for 2 weeks max.",
            "Delivery fees vary based on location, product weight, and the transportation option chosen."
          ]
        },
        {
          question: "Can I track my delivery?",
          answer: "Yes, once your order is confirmed, you'll receive updates on the status of your delivery, you may also follow up with the vendor directly."
        }
      ]
    },
    {
      title: "Refunds and Cancellations",
      questions: [
        {
          question: "What is your refund policy?",
          answer: [
            "We offer full refunds in the following cases:",
            "• The group buy doesn't meet the minimum group size requirements.",
            "• The vendor cancels the order.",
            "• You cancel your order at least 3 days before the purchase window closes.",
            "Refunds are processed within 3-5 business days."
          ]
        },
        {
          question: "What if I receive a damaged or incorrect order?",
          answer: "If there's an issue with your order, please contact our support team immediately. We'll work with the vendor to resolve the issue promptly."
        }
      ]
    },
    {
      title: "Joining or Creating a Group",
      questions: [
        {
          question: "How do I join a group buying offer?",
          answer: "Browse available groups or product deals within your locality on the platform, select the one you're interested in. Follow the prompts to complete your participation."
        },
        {
          question: "Can I create my own group?",
          answer: "Yes! But only when you are registered and verified as a vendor. You can create a group by selecting a product or deal, setting a target quantity, and inviting others to join. Once the target is met, the deal is activated."
        },
        {
          question: "How many people are needed to form a group?",
          answer: "The required number of participants varies depending on the deal. This information will be clearly stated on each group."
        }
      ]
    },
    {
      title: "Safety and Trust",
      questions: [
        {
          question: "Is Foodrient safe to use?",
          answer: "Absolutely! We prioritize the safety and security of our users. All payments are processed through our secure payment partner, Paystack, and vendors are vetted to ensure quality and reliability."
        },
        {
          question: "What if I have an issue with a vendor?",
          answer: "If you encounter any issues with a vendor, such as poor quality or unprofessional behavior, please report it to our support team. We take such matters seriously and will take appropriate action."
        }
      ]
    },
    {
      title: "Technical Support",
      questions: [
        {
          question: "What do I do if I experience technical issues?",
          answer: "For technical issues, such as trouble logging in or navigating the platform, contact our support team at support@foodrient.com or visit our Help Center for troubleshooting guides."
        },
        {
          question: "How do I update my account information?",
          answer: "You can update your account information, including your delivery address and payment details, by logging into your account and navigating to the \"Account Settings\" section."
        }
      ]
    },
    {
      title: "Community and Support",
      questions: [
        {
          question: "How can I connect with other buyers?",
          answer: "Foodrient is all about building community! You can connect with other buyers through group buying deals, share tips, and even create your own groups to explore new food options together."
        },
        {
          question: "Who can I contact for further assistance?",
          answer: "For any questions or concerns, reach out to our support team at support@foodrient.com. We're here to help!"
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-gray-600">
          Welcome to Foodrient! We're excited to have you join our platform, where we revolutionize group food buying in Nigeria. Below, you'll find answers to common questions to help you navigate the platform with ease.
        </p>
      </div>

      <div className="space-y-8">
        {faqSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <h2 className="text-xl font-semibold text-gray-900 p-6 bg-gray-50">{section.title}</h2>
            <div className="divide-y divide-gray-200">
              {section.questions.map((faq, questionIndex) => {
                const id = `${sectionIndex}-${questionIndex}`;
                return (
                  <div key={questionIndex} className="border-t border-gray-200 first:border-0">
                    <button
                      className="w-full text-left px-6 py-4 focus:outline-none hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setOpenIndex(openIndex === id ? null : id)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                        {openIndex === id ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </button>
                    {openIndex === id && (
                      <div className="px-6 pb-4">
                        {Array.isArray(faq.answer) ? (
                          <div className="space-y-2 text-gray-600">
                            {faq.answer.map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">{faq.answer}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-gray-600">
        <p>Thank you for choosing Foodrient! We're committed to making your group buying experience seamless, affordable, and enjoyable. Happy shopping!</p>
      </div>
    </div>
  );
}