-- TABLE: user_sessions — tracks login activity for admin dashboard
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  ip_address text,
  city text,
  country text,
  user_agent text,
  logged_in_at timestamptz DEFAULT now()
);

-- Allow service role full access (no RLS policy needed — service role bypasses RLS)
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS user_sessions_logged_in_at_idx ON user_sessions (logged_in_at DESC);
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions (user_id);

-- VIEW: active_users_count — users who were active in the last 24 hours
CREATE OR REPLACE VIEW active_users_24h AS
SELECT count(DISTINCT user_id) as count
FROM user_sessions
WHERE logged_in_at > now() - interval '24 hours';
