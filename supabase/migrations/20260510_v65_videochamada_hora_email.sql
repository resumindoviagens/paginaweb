-- V65 — Videochamada com data e hora + email

-- Ajusta campos de videochamada para aceitar data e horário.
ALTER TABLE public.clients
ALTER COLUMN video_call_date TYPE timestamp with time zone
USING CASE
  WHEN video_call_date IS NULL THEN NULL
  ELSE video_call_date::timestamp with time zone
END;

ALTER TABLE public.grupos_processo
ALTER COLUMN video_call_date TYPE timestamp with time zone
USING CASE
  WHEN video_call_date IS NULL THEN NULL
  ELSE video_call_date::timestamp with time zone
END;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stage_video_call_scheduled boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stage_video_call_done boolean DEFAULT false;

COMMENT ON COLUMN public.clients.video_call_date IS
'Data e hora da videochamada.';

COMMENT ON COLUMN public.grupos_processo.video_call_date IS
'Data e hora da videochamada do grupo de processo.';
