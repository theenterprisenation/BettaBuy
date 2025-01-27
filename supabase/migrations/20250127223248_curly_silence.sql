-- Create notifications table to store message templates and settings
CREATE TABLE notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Admins can manage notification templates"
  ON notification_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Support can view notification templates"
  ON notification_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'support'
    )
  );

-- Create notification_logs table to track sent messages
CREATE TABLE notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES notification_templates(id),
  recipient_id uuid REFERENCES users(id),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_notification_logs_updated_at
  BEFORE UPDATE ON notification_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Admins can view all notification logs"
  ON notification_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Support can view assigned vendor logs"
  ON notification_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_vendor_assignments sva
      WHERE sva.support_user_id = auth.uid()
      AND sva.vendor_id IN (
        SELECT vendor_id FROM orders WHERE user_id = notification_logs.recipient_id
      )
    )
  );

-- Create function to send notification
CREATE OR REPLACE FUNCTION send_notification(
  template_type text,
  recipient_id uuid,
  variables jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template notification_templates;
  recipient users;
  notification_id uuid;
  processed_body text;
  processed_subject text;
  var_record record;
BEGIN
  -- Get template
  SELECT * INTO template
  FROM notification_templates
  WHERE type = template_type
  AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found for type: %', template_type;
  END IF;

  -- Get recipient
  SELECT * INTO recipient
  FROM users
  WHERE id = recipient_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipient not found: %', recipient_id;
  END IF;

  -- Process template variables
  processed_body := template.body;
  processed_subject := template.subject;

  -- Replace variables in subject and body
  FOR var_record IN SELECT * FROM jsonb_each_text(variables)
  LOOP
    processed_subject := REPLACE(processed_subject, '{{' || var_record.key || '}}', var_record.value);
    processed_body := REPLACE(processed_body, '{{' || var_record.key || '}}', var_record.value);
  END LOOP;

  -- Create notification log
  INSERT INTO notification_logs (
    template_id,
    recipient_id,
    recipient_email,
    subject,
    body,
    status
  ) VALUES (
    template.id,
    recipient_id,
    recipient.email,
    processed_subject,
    processed_body,
    'pending'
  ) RETURNING id INTO notification_id;

  -- Note: Actual email sending will be handled by the application layer
  -- This function only creates the notification record

  RETURN notification_id;
END;
$$;

-- Insert default notification templates
INSERT INTO notification_templates (type, subject, body, variables) VALUES
-- Order confirmation template
('order_confirmation', 
 'Order Confirmation - #{{order_id}}',
 'Dear {{customer_name}},

Thank you for your order! We''re excited to confirm that your group buy order has been received and is being processed.

Order Details:
- Order ID: {{order_id}}
- Product: {{product_name}}
- Quantity: {{quantity}}
- Total Amount: ₦{{total_amount}}
- Delivery Option: {{delivery_option}}

Next Steps:
1. Your order will be confirmed once the minimum group size is reached
2. You''ll receive updates about the group buy status
3. We''ll notify you when the product is ready for delivery/pickup

If you have any questions, please don''t hesitate to contact us.

Best regards,
The Foodrient Team',
 '["order_id", "customer_name", "product_name", "quantity", "total_amount", "delivery_option"]'::jsonb),

-- Delivery update template
('delivery_update',
 'Delivery Update - Order #{{order_id}}',
 'Dear {{customer_name}},

We have an update regarding your order #{{order_id}}.

Status: {{status}}
{{message}}

{{delivery_instructions}}

For any questions, please contact your vendor or support representative.

Best regards,
The Foodrient Team',
 '["order_id", "customer_name", "status", "message", "delivery_instructions"]'::jsonb),

-- Group buy success template
('group_buy_success',
 'Group Buy Success - {{product_name}}',
 'Dear {{customer_name}},

Great news! The group buy for {{product_name}} has reached its minimum size and is now confirmed.

Important Details:
- Product: {{product_name}}
- Share Date: {{share_date}}
- Location: {{location}}
- Your Quantity: {{quantity}}

Next Steps:
1. Your payment will be processed
2. You''ll receive delivery/pickup instructions soon
3. The vendor will prepare your order for the share date

Thank you for participating in this group buy!

Best regards,
The Foodrient Team',
 '["customer_name", "product_name", "share_date", "location", "quantity"]'::jsonb),

-- Promotional message template
('promotional',
 '{{subject}}',
 'Dear {{customer_name}},

{{message}}

{{cta_text}}
{{cta_link}}

If you wish to unsubscribe from promotional messages, please visit your account settings.

Best regards,
The Foodrient Team',
 '["customer_name", "subject", "message", "cta_text", "cta_link"]'::jsonb);

-- Create function to handle order status changes
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS trigger AS $$
BEGIN
  -- Send appropriate notification based on status change
  CASE
    WHEN NEW.status = 'confirmed' THEN
      PERFORM send_notification(
        'order_confirmation',
        NEW.user_id,
        jsonb_build_object(
          'order_id', NEW.id,
          'customer_name', (SELECT full_name FROM users WHERE id = NEW.user_id),
          'product_name', (SELECT name FROM products WHERE id = NEW.product_id),
          'quantity', NEW.quantity,
          'total_amount', NEW.total_amount,
          'delivery_option', NEW.delivery_option
        )
      );
    
    WHEN NEW.status = 'in_transit' THEN
      PERFORM send_notification(
        'delivery_update',
        NEW.user_id,
        jsonb_build_object(
          'order_id', NEW.id,
          'customer_name', (SELECT full_name FROM users WHERE id = NEW.user_id),
          'status', 'In Transit',
          'message', 'Your order is on its way!',
          'delivery_instructions', CASE 
            WHEN NEW.delivery_option = 'pickup' THEN 'Please prepare to pick up your order at the designated location.'
            ELSE 'Our delivery partner will contact you shortly.'
          END
        )
      );
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status changes
CREATE TRIGGER order_status_change_notification
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_order_status_change();