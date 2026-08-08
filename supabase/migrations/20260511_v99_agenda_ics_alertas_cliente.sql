-- V99 — Agenda ICS e lembretes automáticos ao cliente

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS agenda_email_pending_at timestamp with time zone;

CREATE TABLE IF NOT EXISTS public.automation_email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  event_key text NOT NULL,
  event_type text NOT NULL,
  email_type text NOT NULL,
  recipient text NOT NULL,
  send_mode text DEFAULT 'manual',
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS automation_email_logs_event_unique
ON public.automation_email_logs (event_key, email_type, recipient);

CREATE INDEX IF NOT EXISTS automation_email_logs_client_idx
ON public.automation_email_logs (client_id, sent_at DESC);
