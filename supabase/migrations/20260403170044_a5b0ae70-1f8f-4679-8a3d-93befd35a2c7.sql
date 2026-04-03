-- 1. Restrict animals SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view available animals" ON public.animals;
CREATE POLICY "Authenticated users can view available animals"
  ON public.animals
  FOR SELECT
  TO authenticated
  USING (is_available = true);

-- 2. Restrict profiles SELECT to owner only (explicit authenticated scope)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Drop unused enumeration function
DROP FUNCTION IF EXISTS public.find_user_by_email_or_username(text);