-- Add username field to profiles table
ALTER TABLE public.profiles ADD COLUMN username text UNIQUE;

-- Create an index for faster username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Create a function to find user by email or username
CREATE OR REPLACE FUNCTION public.find_user_by_email_or_username(identifier text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- First try to find by email in auth.users
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = identifier;
  
  -- If not found by email, try to find by username in profiles
  IF user_uuid IS NULL THEN
    SELECT user_id INTO user_uuid
    FROM public.profiles
    WHERE username = identifier;
  END IF;
  
  RETURN user_uuid;
END;
$$;