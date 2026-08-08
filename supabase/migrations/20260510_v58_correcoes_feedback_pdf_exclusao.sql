-- V58 — Correções V57: WhatsApp pesquisa, feedback, PDF controle e validade do visto

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS visa_expiration_date date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS feedback_liberado boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS feedback_token text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS feedback_token_expires_at timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_feedback_sent boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_feedback_posted boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_ready_to_archive boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_expiration_date date;

ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS instagram_usuario text;

CREATE INDEX IF NOT EXISTS clients_feedback_token_idx
ON public.clients (feedback_token);

COMMENT ON COLUMN public.clients.visa_expiration_date IS
'Data de validade do visto. Campo individual, não sincronizado com grupo familiar.';
