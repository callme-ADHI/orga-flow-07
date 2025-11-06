-- Fix search_path for auto_approve_ceo function
CREATE OR REPLACE FUNCTION public.auto_approve_ceo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'CEO' THEN
    NEW.approved := true;
  END IF;
  RETURN NEW;
END;
$$;