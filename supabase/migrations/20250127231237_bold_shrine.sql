/*
  # Group Formation Implementation

  1. New Tables
    - `product_groups` - For managing group buying opportunities
    - `group_members` - For tracking group membership
    - `group_invites` - For handling group invitations
    - `group_chat_messages` - For group communication

  2. Security
    - Enable RLS on all tables
    - Add policies for group access and management
    - Ensure data privacy between groups

  3. Functions
    - Group matching based on location and interests
    - Group formation and management
    - Member invitation handling
*/

-- Create product_groups table
CREATE TABLE product_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  target_size integer NOT NULL CHECK (target_size > 0),
  current_size integer DEFAULT 1 CHECK (current_size >= 0),
  status text NOT NULL CHECK (status IN ('forming', 'complete', 'cancelled')),
  location_state text NOT NULL,
  location_city text NOT NULL,
  max_distance_km integer DEFAULT 50,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  share_date timestamptz NOT NULL,
  CONSTRAINT valid_share_date CHECK (share_date > now()),
  CONSTRAINT valid_size CHECK (current_size <= target_size)
);

-- Create group_members table
CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES product_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'left')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_invites table
CREATE TABLE group_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES product_groups(id) ON DELETE CASCADE NOT NULL,
  invited_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  invited_user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id, invited_user_id)
);

-- Create group_chat_messages table
CREATE TABLE group_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES product_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create triggers for updated_at
CREATE TRIGGER update_product_groups_updated_at
  BEFORE UPDATE ON product_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_invites_updated_at
  BEFORE UPDATE ON group_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies for product_groups
CREATE POLICY "Users can view groups in their area"
  ON product_groups
  FOR SELECT
  TO authenticated
  USING (
    status = 'forming' AND
    current_size < target_size
  );

CREATE POLICY "Users can create groups"
  ON product_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group members can view their groups"
  ON product_groups
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Create policies for group_members
CREATE POLICY "Members can view group membership"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM product_groups
      WHERE created_by = auth.uid()
      OR id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid()
        AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can join groups"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM product_groups
      WHERE id = group_id
      AND status = 'forming'
      AND current_size < target_size
    )
  );

-- Create policies for group_invites
CREATE POLICY "Users can view their invites"
  ON group_invites
  FOR SELECT
  TO authenticated
  USING (
    invited_user_id = auth.uid() OR
    invited_by = auth.uid()
  );

CREATE POLICY "Group members can send invites"
  ON group_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_invites.group_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Create policies for group_chat_messages
CREATE POLICY "Group members can view messages"
  ON group_chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_chat_messages.group_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Group members can send messages"
  ON group_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_chat_messages.group_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Create function to find nearby groups
CREATE OR REPLACE FUNCTION find_nearby_groups(
  product_id_param uuid,
  user_state text,
  user_city text,
  max_distance_km integer DEFAULT 50
)
RETURNS TABLE (
  group_id uuid,
  group_name text,
  target_size integer,
  current_size integer,
  distance_km integer,
  share_date timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pg.id as group_id,
    pg.name as group_name,
    pg.target_size,
    pg.current_size,
    -- For now, using simple city/state matching
    -- In a real app, would use proper geolocation
    CASE
      WHEN pg.location_city = user_city AND pg.location_state = user_state THEN 0
      WHEN pg.location_state = user_state THEN 25
      ELSE 50
    END as distance_km,
    pg.share_date
  FROM product_groups pg
  WHERE pg.product_id = product_id_param
  AND pg.status = 'forming'
  AND pg.current_size < pg.target_size
  AND (
    pg.location_city = user_city
    OR (
      pg.location_state = user_state
      AND pg.max_distance_km >= 25
    )
    OR pg.max_distance_km >= 50
  )
  ORDER BY distance_km, pg.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to join group
CREATE OR REPLACE FUNCTION join_group(
  group_id_param uuid
)
RETURNS boolean AS $$
DECLARE
  group_record product_groups;
BEGIN
  -- Get group details with row lock
  SELECT * INTO group_record
  FROM product_groups
  WHERE id = group_id_param
  FOR UPDATE;

  -- Check if group is available
  IF group_record.status != 'forming' OR group_record.current_size >= group_record.target_size THEN
    RETURN false;
  END IF;

  -- Add member
  INSERT INTO group_members (group_id, user_id, status)
  VALUES (group_id_param, auth.uid(), 'active');

  -- Update group size
  UPDATE product_groups
  SET 
    current_size = current_size + 1,
    status = CASE 
      WHEN current_size + 1 = target_size THEN 'complete'
      ELSE status
    END
  WHERE id = group_id_param;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_product_groups_product ON product_groups(product_id);
CREATE INDEX idx_product_groups_location ON product_groups(location_state, location_city);
CREATE INDEX idx_product_groups_status ON product_groups(status, current_size, target_size);
CREATE INDEX idx_group_members_user ON group_members(user_id, status);
CREATE INDEX idx_group_invites_user ON group_invites(invited_user_id, status);
CREATE INDEX idx_group_chat_messages_group ON group_chat_messages(group_id, created_at);