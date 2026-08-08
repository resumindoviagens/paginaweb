-- V114 — Alerta/agenda interna para marcar videochamada 20 dias antes do CASV

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS casv_video_planning_email_sent_at timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS casv_video_planning_for_date date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS casv_video_planning_alert_sent_at timestamp with time zone;
