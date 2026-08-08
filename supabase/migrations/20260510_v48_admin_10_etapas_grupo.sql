-- V48 — Admin: 10 etapas unificadas + data de início no grupo/processo

-- Campos no cliente
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status text DEFAULT 'not_started';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_ds160_completed boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_fee_generated boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_fee_paid boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_dates_scheduled boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_interview_done boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_passport_returned boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS data_inicio_processo date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS data_final_processo date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS observacoes_gerais text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tipo_processo text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS grupo_familiar_master boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS sincronizar_com_grupo boolean DEFAULT true;

-- Campo de data inicial no grupo de processo
ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS data_inicio_processo date;

-- Regularização: se o cliente já avançou para qualquer etapa acima do DS-160,
-- consideramos que as 3 etapas iniciais já foram concluídas, isto é, status = submitted.
UPDATE public.clients
SET status = 'submitted'
WHERE COALESCE(stage_ds160_completed,false)
   OR COALESCE(stage_fee_generated,false)
   OR COALESCE(stage_fee_paid,false)
   OR COALESCE(stage_dates_scheduled,false)
   OR COALESCE(stage_interview_done,false)
   OR COALESCE(stage_passport_returned,false)
   OR visa_result IS NOT NULL;

-- Cadastros sem status passam a ser Não iniciado.
UPDATE public.clients
SET status = 'not_started'
WHERE status IS NULL OR status = '';

COMMENT ON COLUMN public.grupos_processo.data_inicio_processo IS
'Data de início do processo comum ao grupo familiar/processo.';
