
-- colaboradores: only admin or gestor can read
DROP POLICY IF EXISTS "colaboradores_select_any_authenticated" ON public.colaboradores;
DROP POLICY IF EXISTS "Authenticated users can view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "colaboradores_select" ON public.colaboradores;
CREATE POLICY "colaboradores_select_admin_gestor" ON public.colaboradores
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- exames: only admin or gestor can read
DROP POLICY IF EXISTS "exames_select_auth_misconfigured" ON public.exames;
DROP POLICY IF EXISTS "Authenticated users can view exames" ON public.exames;
DROP POLICY IF EXISTS "exames_select" ON public.exames;
CREATE POLICY "exames_select_admin_gestor" ON public.exames
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- alertas: only admin or gestor
DROP POLICY IF EXISTS "alertas_select_auth_misconfigured" ON public.alertas;
DROP POLICY IF EXISTS "Authenticated users can view alertas" ON public.alertas;
DROP POLICY IF EXISTS "alertas_select" ON public.alertas;
CREATE POLICY "alertas_select_admin_gestor" ON public.alertas
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- profiles: own row or admin
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin_misconfigured" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- Revoke execute on is_admin from authenticated (has_role is used inside RLS policies as SQL functions and needs to remain callable by policy evaluation, but we can still revoke from authenticated since policies run as the definer context)
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
