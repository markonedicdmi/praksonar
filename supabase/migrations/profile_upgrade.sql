-- Add avatar_url and cv_url columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cv_url text;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Storage policies for cvs bucket
CREATE POLICY "Users can upload own cv"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own cv"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own cv"
ON storage.objects FOR DELETE
USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "CVs are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'cvs');
