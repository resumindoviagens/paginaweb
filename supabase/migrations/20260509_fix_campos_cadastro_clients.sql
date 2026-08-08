-- Correção preventiva — campos de cadastro usados pelo Admin
-- Execute no Supabase > SQL Editor > New Query > Run

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_inicio_processo date;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_final_processo date;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS observacoes_gerais text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS tipo_processo text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS grupo_processo text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS rastreio_passaporte text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_casv date;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_entrevista date;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_videochamada timestamp with time zone;

COMMENT ON COLUMN public.clients.data_inicio_processo IS
'Data de início do processo do cliente.';

COMMENT ON COLUMN public.clients.data_final_processo IS
'Data de encerramento operacional do processo.';

COMMENT ON COLUMN public.clients.observacoes_gerais IS
'Observações gerais internas do processo.';
