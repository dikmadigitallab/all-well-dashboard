-- =============================================
-- ALL-WELL DASHBOARD - MIGRAÇÃO COMPLETA
-- Gerada em: 2026-07-16T19:01:58.116Z
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

-- >>> 20260716033746_35107d6a-0143-4d0b-9582-4f8eb11bb745.sql
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'gestor');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') $$;

-- Auto-create profile on signup; first user becomes admin, others become gestor.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'gestor')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ COLABORADORES ============
CREATE TYPE public.aso_status AS ENUM ('em_dia', 'a_vencer', 'vencido', 'sem_exame');

CREATE TABLE public.colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  empresa TEXT,
  area TEXT,
  setor TEXT,
  funcao TEXT,
  matricula_sap TEXT,
  cpf TEXT,
  rg TEXT,
  pis TEXT,
  nascimento DATE,
  escala_turno TEXT,
  ghe TEXT,
  periodicidade_meses INT DEFAULT 12,
  unidade TEXT,
  ultimo_exame DATE,
  proximo_exame DATE,
  dias_para_vencer INT,
  status public.aso_status NOT NULL DEFAULT 'sem_exame',
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_colaboradores_empresa ON public.colaboradores(empresa);
CREATE INDEX idx_colaboradores_unidade ON public.colaboradores(unidade);
CREATE INDEX idx_colaboradores_setor ON public.colaboradores(setor);
CREATE INDEX idx_colaboradores_status ON public.colaboradores(status);
CREATE INDEX idx_colaboradores_proximo_exame ON public.colaboradores(proximo_exame);
CREATE INDEX idx_colaboradores_cpf ON public.colaboradores(cpf);
CREATE INDEX idx_colaboradores_nome ON public.colaboradores(nome);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.colaboradores TO authenticated;
GRANT ALL ON public.colaboradores TO service_role;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "col_select_any_authenticated" ON public.colaboradores FOR SELECT TO authenticated USING (true);
CREATE POLICY "col_insert_admin" ON public.colaboradores FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "col_update_admin" ON public.colaboradores FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "col_delete_admin" ON public.colaboradores FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-calculate status + dias
CREATE OR REPLACE FUNCTION public.calc_colaborador_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  d INT;
BEGIN
  IF NEW.proximo_exame IS NULL THEN
    NEW.status := 'sem_exame';
    NEW.dias_para_vencer := NULL;
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
END;
$$;

CREATE TRIGGER trg_colab_status
  BEFORE INSERT OR UPDATE ON public.colaboradores
  FOR EACH ROW EXECUTE FUNCTION public.calc_colaborador_status();

-- ============ EXAMES (histórico) ============
CREATE TYPE public.exame_tipo AS ENUM ('admissional','periodico','demissional','retorno_ao_trabalho','mudanca_riscos','complementar');
CREATE TYPE public.exame_status AS ENUM ('agendado','compareceu','faltou','pendente','cancelado','realizado');
CREATE TYPE public.pendencia_motivo AS ENUM ('agendamento','falta_colaborador','documentacao','afastamento','recusa','outro');

CREATE TABLE public.exames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo public.exame_tipo NOT NULL DEFAULT 'periodico',
  data_agendada DATE,
  data_realizado DATE,
  data_vencimento DATE,
  status public.exame_status NOT NULL DEFAULT 'agendado',
  clinica TEXT,
  medico TEXT,
  motivo_pendencia public.pendencia_motivo,
  justificativa TEXT,
  arquivo_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_exames_colab ON public.exames(colaborador_id);
CREATE INDEX idx_exames_status ON public.exames(status);
CREATE INDEX idx_exames_data ON public.exames(data_agendada);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exames TO authenticated;
GRANT ALL ON public.exames TO service_role;
ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exames_select_auth" ON public.exames FOR SELECT TO authenticated USING (true);
CREATE POLICY "exames_write_admin" ON public.exames FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "exames_update_admin" ON public.exames FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "exames_delete_admin" ON public.exames FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ ALERTAS ============
CREATE TYPE public.alerta_tipo AS ENUM ('aso_vencendo','aso_vencido','exame_pendente','falta_exame','reagendamento');
CREATE TABLE public.alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo public.alerta_tipo NOT NULL,
  mensagem TEXT NOT NULL,
  lido BOOLEAN NOT NULL DEFAULT false,
  email_enviado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_alertas_lido ON public.alertas(lido);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alertas TO authenticated;
GRANT ALL ON public.alertas TO service_role;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alertas_select_auth" ON public.alertas FOR SELECT TO authenticated USING (true);
CREATE POLICY "alertas_update_auth" ON public.alertas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "alertas_write_admin" ON public.alertas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- >>> 20260716033810_afb9cf91-87ab-4854-aecd-46704c6f5340.sql
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

-- >>> 20260716034438_d9e5cd6d-3c76-46c2-a052-97eea7ed6211.sql
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

-- >>> 20260716034452_0eb7306f-4278-4573-b271-9bb49865fd71.sql
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

