-- TABLE: internships
CREATE TABLE IF NOT EXISTS internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  description text,
  location text,
  is_international boolean DEFAULT false,
  field text,
  required_skills text[],
  required_languages jsonb,
  source_url text UNIQUE,
  source_name text,
  deadline date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE: user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  university text,
  field_of_study text,
  study_level text CHECK (study_level IN ('bachelor', 'master')),
  skills text[],
  languages jsonb,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  email_notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- TABLE: saved_internships
CREATE TABLE IF NOT EXISTS saved_internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  internship_id uuid REFERENCES internships(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, internship_id)
);

-- TABLE: cv_generations
CREATE TABLE IF NOT EXISTS cv_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  internship_id uuid REFERENCES internships(id) ON DELETE SET NULL,
  output_text text,
  language text CHECK (language IN ('sr', 'en')),
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_generations ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- internships: public read, service role write only
CREATE POLICY "Internships are viewable by everyone"
ON internships FOR SELECT
USING (true);
-- (No INSERT/UPDATE/DELETE policies means only service role can write)

-- user_profiles: users read/write own row only
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON user_profiles FOR DELETE
USING (auth.uid() = id);

-- saved_internships: users access own rows only
CREATE POLICY "Users can view own saved internships"
ON saved_internships FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved internships"
ON saved_internships FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved internships"
ON saved_internships FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved internships"
ON saved_internships FOR DELETE
USING (auth.uid() = user_id);

-- cv_generations: users read own rows, service role inserts
CREATE POLICY "Users can view own cv generations"
ON cv_generations FOR SELECT
USING (auth.uid() = user_id);
-- (No INSERT policy means users cannot insert; only service role can)

-- INDEXES
CREATE INDEX IF NOT EXISTS internships_field_idx ON internships (field);
CREATE INDEX IF NOT EXISTS internships_is_international_idx ON internships (is_international);
CREATE INDEX IF NOT EXISTS internships_created_at_desc_idx ON internships (created_at DESC);

-- FUNCTION: check_daily_cv_limit
CREATE OR REPLACE FUNCTION check_daily_cv_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  generation_count integer;
BEGIN
  -- count cv_generations for user since midnight today
  SELECT count(*)
  INTO generation_count
  FROM cv_generations
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('day', now());
    
  -- return true if count < 3, false if limit reached
  RETURN generation_count < 3;
END;
$$;
