-- V106 — Automação de emails do módulo de viagens

ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS automation_enabled boolean DEFAULT true;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS calendar_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS offer_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS checkin_outbound_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS checkin_return_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS airport_outbound_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS airport_return_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS travel_automation_notes text;

CREATE TABLE IF NOT EXISTS public.travel_email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_trip_id uuid REFERENCES public.travel_trips(id) ON DELETE CASCADE,
  template_id text NOT NULL,
  send_mode text DEFAULT 'manual',
  recipients text[] DEFAULT '{}',
  sent_at timestamp with time zone DEFAULT now(),
  error text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS travel_email_logs_trip_idx ON public.travel_email_logs(travel_trip_id, sent_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS travel_email_logs_auto_unique
ON public.travel_email_logs (travel_trip_id, template_id, send_mode)
WHERE send_mode = 'auto';
