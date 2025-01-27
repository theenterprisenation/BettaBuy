-- Add support role permissions and relationships

-- Create support_permissions table to define what support staff can do
CREATE TABLE support_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_permissions ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_support_permissions_updated_at
  BEFORE UPDATE ON support_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default support permissions
INSERT INTO support_permissions (name, description) VALUES
  ('view_vendor_details', 'View assigned vendor details and statistics'),
  ('manage_vendor_products', 'Review and manage vendor products'),
  ('view_vendor_orders', 'View and track vendor orders'),
  ('manage_vendor_support', 'Provide support and resolve vendor issues'),
  ('view_analytics', 'View analytics for assigned vendors'),
  ('send_notifications', 'Send notifications to vendors and customers');

-- Create support_role_permissions junction table
CREATE TABLE support_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  support_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES support_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(support_user_id, permission_id)
);

-- Enable RLS
ALTER TABLE support_role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for support_permissions
CREATE POLICY "Admins can manage permissions"
  ON support_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Support can view permissions"
  ON support_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'support'
    )
  );

-- Create policies for support_role_permissions
CREATE POLICY "Admins can manage role permissions"
  ON support_role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Support can view their permissions"
  ON support_role_permissions
  FOR SELECT
  TO authenticated
  USING (support_user_id = auth.uid());

-- Create function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_support_permission(permission_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM support_role_permissions srp
    JOIN support_permissions sp ON srp.permission_id = sp.id
    WHERE srp.support_user_id = auth.uid()
    AND sp.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign default permissions to new support staff
CREATE OR REPLACE FUNCTION assign_default_support_permissions()
RETURNS trigger AS $$
BEGIN
  -- Only proceed if the user is assigned the support role
  IF EXISTS (
    SELECT 1 FROM roles r
    WHERE r.id = NEW.role_id AND r.name = 'support'
  ) THEN
    -- Assign all default permissions
    INSERT INTO support_role_permissions (support_user_id, permission_id)
    SELECT NEW.id, id FROM support_permissions;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign permissions to new support staff
CREATE TRIGGER assign_support_permissions_trigger
  AFTER INSERT OR UPDATE OF role_id ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_support_permissions();

-- Create support activity logs
CREATE TABLE support_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  support_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for support activity logs
CREATE POLICY "Admins can view all activity logs"
  ON support_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Support can view their own logs"
  ON support_activity_logs
  FOR SELECT
  TO authenticated
  USING (support_user_id = auth.uid());

CREATE POLICY "Support can create logs"
  ON support_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    support_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM support_vendor_assignments
      WHERE support_user_id = auth.uid()
      AND vendor_id = support_activity_logs.vendor_id
    )
  );

-- Create function to log support activity
CREATE OR REPLACE FUNCTION log_support_activity(
  vendor_id_param uuid,
  action_param text,
  details_param jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO support_activity_logs (
    support_user_id,
    vendor_id,
    action,
    details
  ) VALUES (
    auth.uid(),
    vendor_id_param,
    action_param,
    details_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_support_role_permissions_user ON support_role_permissions(support_user_id);
CREATE INDEX idx_support_activity_logs_user ON support_activity_logs(support_user_id);
CREATE INDEX idx_support_activity_logs_vendor ON support_activity_logs(vendor_id);
CREATE INDEX idx_support_activity_logs_date ON support_activity_logs(created_at);