-- V59 — Pesquisa enviada/respondida com alerta interno

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stage_feedback_sent boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stage_feedback_answered boolean DEFAULT false;

-- Mantém etapa já existente de postagem, caso você use depois.
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stage_feedback_posted boolean DEFAULT false;

COMMENT ON COLUMN public.clients.stage_feedback_sent IS
'Etapa marcada automaticamente quando o email/link da pesquisa de satisfação é enviado/gerado.';

COMMENT ON COLUMN public.clients.stage_feedback_answered IS
'Etapa marcada automaticamente quando o cliente responde a pesquisa de satisfação.';
