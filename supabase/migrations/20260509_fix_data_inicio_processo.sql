-- Correção — coluna ausente data_inicio_processo
-- Execute no Supabase > SQL Editor > New Query > Run

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_inicio_processo date;

COMMENT ON COLUMN public.clients.data_inicio_processo IS
'Data de início do processo do cliente.';
