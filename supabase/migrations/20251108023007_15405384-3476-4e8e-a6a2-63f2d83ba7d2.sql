-- Fix function search_path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_custom_id(role_type text, org_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  next_id INTEGER;
  prefix TEXT;
BEGIN
  IF role_type = 'CEO' THEN
    RETURN 'CEO001';
  ELSIF role_type = 'Manager' THEN
    prefix := 'MNR';
  ELSE
    prefix := 'EMP';
  END IF;
  
  SELECT COUNT(*) + 1 INTO next_id
  FROM public.profiles
  WHERE org_id = org_uuid AND role = role_type;
  
  RETURN prefix || LPAD(next_id::TEXT, 5, '0');
END;
$function$;