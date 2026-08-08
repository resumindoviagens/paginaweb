-- V41 — Feedbacks / alertas / cards Instagram

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_answered_at timestamp with time zone;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_nota_nps integer;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_alert_email_sent_at timestamp with time zone;

ALTER TABLE public.feedbacks
ADD COLUMN IF NOT EXISTS instagram_card_generated_at timestamp with time zone;

ALTER TABLE public.feedbacks
ADD COLUMN IF NOT EXISTS instagram_card_url text;
