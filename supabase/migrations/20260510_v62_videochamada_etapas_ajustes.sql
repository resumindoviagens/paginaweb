-- V62 — Videochamada nas etapas e ajustes individuais

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stage_video_call_scheduled boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stage_video_call_done boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS visa_expiration_date date;

-- Regularização dos cadastros já avançados:
-- se já chegou em entrevista realizada ou etapas posteriores, as novas etapas de videochamada ficam concluídas.
UPDATE public.clients
SET
  stage_video_call_scheduled = true,
  stage_video_call_done = true
WHERE COALESCE(stage_interview_done, false)
   OR visa_result IS NOT NULL
   OR COALESCE(stage_passport_returned, false)
   OR COALESCE(stage_feedback_sent, false)
   OR COALESCE(stage_feedback_answered, false)
   OR COALESCE(stage_feedback_posted, false)
   OR COALESCE(stage_ready_to_archive, false);

-- Se já tem CASV ou entrevista preenchidos, marca Datas agendadas.
UPDATE public.clients
SET stage_dates_scheduled = true
WHERE casv_date IS NOT NULL
   OR interview_date IS NOT NULL;

COMMENT ON COLUMN public.clients.stage_video_call_scheduled IS
'Etapa: videochamada agendada.';

COMMENT ON COLUMN public.clients.stage_video_call_done IS
'Etapa: videochamada realizada.';

COMMENT ON COLUMN public.clients.visa_expiration_date IS
'Validade do visto. Campo individual, não sincronizado com grupo familiar.';
