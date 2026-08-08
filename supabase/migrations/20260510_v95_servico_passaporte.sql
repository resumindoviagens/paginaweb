-- V95 — Serviço de emissão de passaporte + feedback por serviço

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.clients'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%cpf%'
      AND pg_get_constraintdef(oid) ILIKE '%birth_date%'
  LOOP
    EXECUTE format('ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_passport_docs_email_sent boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_passport_form_filled boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_passport_instructions_sent boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_passport_pf_done boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_passport_ready boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_passport_picked_up boolean DEFAULT false;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_pf_city text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_pf_location text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_pf_datetime timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_gru_paid_at date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS feedback_service text DEFAULT 'visto';

CREATE INDEX IF NOT EXISTS clients_cpf_birth_tipo_idx
ON public.clients (cpf, birth_date, tipo_processo);

UPDATE public.clients
SET feedback_service = 'passaporte'
WHERE tipo_processo ILIKE '%passaporte%'
  AND (feedback_service IS NULL OR feedback_service = 'visto');

UPDATE public.clients
SET feedback_service = 'canadense'
WHERE tipo_processo ILIKE '%canad%'
  AND (feedback_service IS NULL OR feedback_service = 'visto');


-- V96 complemento: remove também constraint única somente por CPF, como clients_cpf_key.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.clients'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%cpf%'
  LOOP
    EXECUTE format('ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

-- Passaporte é cadastro de controle, não deve gerar link de formulário.
UPDATE public.clients
SET no_form_required = true,
    access_token = NULL
WHERE tipo_processo = 'Passaporte';
