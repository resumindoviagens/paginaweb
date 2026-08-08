-- V96 — Correção Passaporte sem link + CPF duplicado por processo

-- Remove constraints únicas que bloqueiam novo processo para o mesmo CPF.
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

-- Garante que processos de passaporte sejam cadastros de controle, sem formulário do visto.
UPDATE public.clients
SET no_form_required = true,
    access_token = NULL
WHERE tipo_processo = 'Passaporte';

-- Índice não único para manter busca rápida por CPF/nascimento/tipo.
CREATE INDEX IF NOT EXISTS clients_cpf_birth_tipo_idx
ON public.clients (cpf, birth_date, tipo_processo);
