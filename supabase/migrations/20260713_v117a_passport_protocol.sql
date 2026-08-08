-- V117A — Protocolo de passaporte
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_protocol text;
