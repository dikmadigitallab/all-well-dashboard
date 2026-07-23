-- Add columns for exam stages (1st and 2nd)
ALTER TABLE public.exames 
ADD COLUMN IF NOT EXISTS data_1_etapa DATE,
ADD COLUMN IF NOT EXISTS data_2_etapa DATE,
ADD COLUMN IF NOT EXISTS justificativa_falta TEXT,
ADD COLUMN IF NOT EXISTS etapa_faltou INT;

-- Update the status calculation trigger: change from 30 to 60 days for a_vencer
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
    ELSIF d <= 60 THEN NEW.status := 'a_vencer';
    ELSE NEW.status := 'em_dia';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;