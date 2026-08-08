-- V46 — Grupo familiar: master visível e sincronização real

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS group_process_id uuid;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS grupo_familiar_master boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS grupo_familiar_master_id uuid REFERENCES public.clients(id);

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS sincronizar_com_grupo boolean DEFAULT true;

-- Campos sincronizáveis usados pelo sistema atual
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_ds160_completed boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_fee_generated boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_fee_paid boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_dates_scheduled boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_interview_done boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_passport_returned boolean DEFAULT false;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS interview_date date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS casv_date date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS video_call_date date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS consulate_city text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_tracking_code text;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS data_inicio_processo date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS data_final_processo date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS observacoes_gerais text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tipo_processo text;

CREATE INDEX IF NOT EXISTS clients_group_process_id_idx ON public.clients (group_process_id);
CREATE INDEX IF NOT EXISTS clients_grupo_familiar_master_id_idx ON public.clients (grupo_familiar_master_id);

COMMENT ON COLUMN public.clients.grupo_familiar_master IS
'Indica se este cliente é o contato principal/master do grupo familiar.';

COMMENT ON COLUMN public.clients.sincronizar_com_grupo IS
'Permite que este membro receba sincronizações do contato principal.';
