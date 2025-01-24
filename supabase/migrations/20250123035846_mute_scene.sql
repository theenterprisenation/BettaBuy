-- Insert FAQ content into site_content table
INSERT INTO site_content (type, key, value)
VALUES (
  'text',
  'faq_content',
  '[
    {
      "question": "What is group buying?",
      "answer": "Group buying is a purchasing strategy where multiple buyers come together to buy products in bulk, allowing them to access better prices and deals than they could get individually."
    },
    {
      "question": "How does payment work?",
      "answer": "Payment is required 2 days before the product sharing day. We accept various payment methods including bank transfers and cards. All payments are secured and processed through our trusted payment partners."
    },
    {
      "question": "What happens if the minimum group size isn''t reached?",
      "answer": "If a group buy doesn''t reach its minimum size by the deadline, all participants will be notified and any payments made will be fully refunded within 3-5 business days."
    },
    {
      "question": "How is delivery handled?",
      "answer": "We offer three delivery options: Pickup from designated locations, Door-step delivery, and Stockpiling (for non-perishable items only). Delivery fees vary based on location and option chosen."
    },
    {
      "question": "What is your refund policy?",
      "answer": "We offer full refunds if: the group buy doesn''t meet minimum requirements, the vendor cancels the order, or if you cancel at least 3 days before the purchase window closes."
    }
  ]'::jsonb
) ON CONFLICT (type, key) DO UPDATE
  SET value = EXCLUDED.value;