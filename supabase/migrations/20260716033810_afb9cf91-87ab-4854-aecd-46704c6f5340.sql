
-- Fix search_path on calc function
CREATE OR REPLACE FUNCTION public.calc_colaborador_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE d INT;
BEGIN
  IF NEW.proximo_exame IS NULL THEN
    NEW.status := 'sem_exame'; NEW.dias_para_vencer := NULL;
  ELSE
    d := (NEW.proximo_exame - CURRENT_DATE);
    NEW.dias_para_vencer := d;
    IF d < 0 THEN NEW.status := 'vencido';
    ELSIF d <= 30 THEN NEW.status := 'a_vencer';
    ELSE NEW.status := 'em_dia';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

-- Revoke public execute on SECURITY DEFINER functions; keep has_role/is_admin callable by authenticated (needed by RLS via SQL, actually RLS runs as definer — but policies call has_role which needs execute for the querying role)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.calc_colaborador_status() FROM PUBLIC, anon, authenticated;
-- has_role / is_admin are used by RLS policies executed by authenticated role — keep EXECUTE for authenticated
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Tighten alertas update policy
DROP POLICY IF EXISTS "alertas_update_auth" ON public.alertas;
CREATE POLICY "alertas_update_admin" ON public.alertas FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
