-- Enforce maximum of 5 admin accounts
CREATE OR REPLACE FUNCTION public.enforce_admin_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin'::public.app_role THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin'::public.app_role) >= 5 THEN
      RAISE EXCEPTION 'Admin limit reached: a maximum of 5 admin accounts is allowed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_admin_limit_trigger ON public.user_roles;

CREATE TRIGGER enforce_admin_limit_trigger
BEFORE INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_admin_limit();