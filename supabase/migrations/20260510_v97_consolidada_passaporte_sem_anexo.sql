-- V97 — Consolidada: serviço de passaporte, CPF por processo, feedback por serviço e instruções sem anexo

-- 1) Permite múltiplos processos para a mesma pessoa.
-- Remove constraints únicas antigas envolvendo cpf/birth_date e também clients_cpf_key.
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_cpf_key;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.clients'::regclass
      AND contype = 'u'
      AND (
        pg_get_constraintdef(oid) ILIKE '%cpf%'
        OR pg_get_constraintdef(oid) ILIKE '%birth_date%'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

-- 2) Campos próprios do fluxo de passaporte.
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

-- 3) Pesquisa por serviço.
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS feedback_service text DEFAULT 'visto';
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS service text DEFAULT 'visto';

-- 4) Índice auxiliar, sem unicidade, para localizar processos da mesma pessoa.
CREATE INDEX IF NOT EXISTS clients_cpf_birth_tipo_idx
ON public.clients (cpf, birth_date, tipo_processo);

-- 5) Ajusta registros já existentes.
UPDATE public.clients
SET
  feedback_service = 'passaporte',
  no_form_required = true,
  access_token = NULL
WHERE tipo_processo ILIKE '%passaporte%';

UPDATE public.clients
SET feedback_service = 'canadense'
WHERE tipo_processo ILIKE '%canad%'
  AND (feedback_service IS NULL OR feedback_service = 'visto');

UPDATE public.clients
SET feedback_service = 'visto'
WHERE feedback_service IS NULL;
