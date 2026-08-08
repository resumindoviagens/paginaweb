-- V120A — Feedback de passaporte

ALTER TABLE public.feedbacks DROP CONSTRAINT IF EXISTS feedbacks_tipo_feedback_check;
ALTER TABLE public.feedbacks ADD CONSTRAINT feedbacks_tipo_feedback_check
  CHECK (tipo_feedback IN ('aprovado', 'negado', 'passaporte', 'canadense'));
