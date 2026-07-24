-- Ajusta o trigger de cálculo de status: de 30 para 60 dias ("a_vencer")
-- E recalcula todos os registros existentes

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

-- Recalcula status e dias_para_vencer de todos os colaboradores existentes
UPDATE public.colaboradores
SET proximo_exame = proximo_exame
WHERE proximo_exame IS NOT NULL;