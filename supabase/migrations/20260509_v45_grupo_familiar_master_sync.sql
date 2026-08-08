-- V45 — Grupo familiar com contato principal e sincronização segura

-- Campos para controle de grupo familiar
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS grupo_familiar_id text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS grupo_familiar_nome text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS grupo_familiar_master boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS grupo_familiar_master_id uuid REFERENCES public.clients(id);

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS sincronizar_com_grupo boolean DEFAULT true;

-- Campos de processo que precisam existir para sincronização
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_inicio_processo date;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_final_processo date;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS observacoes_gerais text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS tipo_processo text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS grupo_processo text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS rastreio_passaporte text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_casv date;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_entrevista date;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_videochamada timestamp with time zone;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS process_steps jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 1;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS etapa_atual text;

-- Índices úteis
CREATE INDEX IF NOT EXISTS clients_grupo_familiar_id_idx
ON public.clients (grupo_familiar_id);

CREATE INDEX IF NOT EXISTS clients_grupo_familiar_master_id_idx
ON public.clients (grupo_familiar_master_id);

COMMENT ON COLUMN public.clients.grupo_familiar_id IS
'Identificador textual do grupo familiar/processo coletivo.';

COMMENT ON COLUMN public.clients.grupo_familiar_master IS
'Indica se este cliente é o contato principal/master do grupo familiar.';

COMMENT ON COLUMN public.clients.grupo_familiar_master_id IS
'Cliente master ao qual este membro está vinculado.';

COMMENT ON COLUMN public.clients.sincronizar_com_grupo IS
'Permite que este membro receba sincronizações do contato principal.';
