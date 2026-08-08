-- V74 — Etapa 1: editor de email, feedbacks e alertas

-- Garante colunas usadas pela agenda de feedbacks.
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stage_feedback_sent boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stage_feedback_answered boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stage_feedback_posted boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_liberado boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_token text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_token_expires_at timestamp with time zone;

-- Tabela de baixas de alertas, caso ainda não exista.
CREATE TABLE IF NOT EXISTS public.admin_alert_dismissals (
  alert_key text PRIMARY KEY,
  dismissed_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clients_feedback_token_idx ON public.clients (feedback_token);
