-- V102 — Emails do controle de viagens + localizador

ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS booking_locator text;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS return_booking_locator text;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS calendar_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS offer_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS checkin_outbound_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS checkin_return_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS airport_outbound_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS airport_return_email_sent_at timestamp with time zone;
