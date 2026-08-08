-- V57 — Validade do visto + WhatsApp pesquisa + prévia estática
-- Execute este SQL mesmo que a V55/V56 NÃO tenham sido executadas.

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS visa_expiration_date date;

COMMENT ON COLUMN public.clients.visa_expiration_date IS
'Data de validade do visto. Campo individual, não sincronizado com grupo familiar.';

-- Garante colunas usadas pelas etapas e feedbacks atuais, caso alguma migration anterior não tenha sido executada.
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_feedback_sent boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_feedback_posted boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_ready_to_archive boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_expiration_date date;

ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS instagram_usuario text;
