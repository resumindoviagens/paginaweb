-- V121 — horários reais, automação de agenda e suporte a cidades com compromisso único
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS casv_datetime timestamptz;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS interview_datetime timestamptz;
ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS casv_datetime timestamptz;
ALTER TABLE public.grupos_processo ADD COLUMN IF NOT EXISTS interview_datetime timestamptz;
