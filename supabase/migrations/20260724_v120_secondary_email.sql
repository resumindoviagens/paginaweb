-- V120 — E-mail secundário
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS secondary_email text;
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS secondary_email text;
