-- V117 — Ficha rápida DS-160 / Operação

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ds160_number text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_display_name text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_surname text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ds160_individual_notes text;

ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS ds160_travel_date date;
ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS ds160_trip_duration_days integer;
ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS ds160_destination_city text;
ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS ds160_selected_hotel_name text;
ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS ds160_selected_hotel_address text;
ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS ds160_selected_hotel_phone text;
ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS ds160_common_notes text;
ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS ds160_common_security_answers text;
