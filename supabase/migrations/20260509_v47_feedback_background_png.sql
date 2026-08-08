-- V47 — Postagens de feedback usando PNG + escolha manual da imagem

ALTER TABLE public.feedbacks
ADD COLUMN IF NOT EXISTS background_index integer;

COMMENT ON COLUMN public.feedbacks.background_index IS
'Número da imagem de fundo usada no card do Instagram: 1 a 30.';
