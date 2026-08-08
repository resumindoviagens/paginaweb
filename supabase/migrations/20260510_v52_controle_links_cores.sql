-- V52 — Controle sem link e destaque de grupos

-- Permite cadastro de controle sem access_token.
ALTER TABLE public.clients ALTER COLUMN access_token DROP NOT NULL;

-- Remove links já existentes dos cadastros marcados como controle.
UPDATE public.clients
SET access_token = NULL
WHERE COALESCE(no_form_required, false) = true;

-- Gera token simples para clientes não-controle que eventualmente estejam sem link.
UPDATE public.clients
SET access_token = replace(gen_random_uuid()::text, '-', '')
WHERE access_token IS NULL
  AND COALESCE(no_form_required, false) = false;
