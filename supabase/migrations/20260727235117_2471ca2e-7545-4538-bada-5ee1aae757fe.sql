CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'gestor');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role public.app_role NOT NULL DEFAULT 'gestor',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS users_username_idx ON public.users(username);

INSERT INTO public.users (username, password_hash, full_name, role, ativo)
VALUES ('admin', '$2b$10$yEsEiqQRkth9gxe0Nku6uedomemNB20.37UQls6bFK6.Kf2RSgfh2', 'Administrador', 'admin', true)
ON CONFLICT (username) DO NOTHING;