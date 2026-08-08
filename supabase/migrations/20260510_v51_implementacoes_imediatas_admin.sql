-- V51 — Implementações imediatas no Admin

-- Novas etapas do processo
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_feedback_sent boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_feedback_posted boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_ready_to_archive boolean DEFAULT false;

-- Controle do cadastro sem formulário
ALTER TABLE public.clients ALTER COLUMN access_token DROP NOT NULL;

-- Validade do passaporte
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS passport_expiration_date date;

-- Pesquisa de satisfação / Instagram
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS instagram_usuario text;

-- Data final automática já utiliza coluna existente, mas garantimos sua existência
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS data_final_processo date;

-- Regularização: cadastro sem token e que não é controle recebe token
-- Observação: este UPDATE usa gen_random_uuid como fallback simples se a função customizada não existir.
UPDATE public.clients
SET access_token = replace(gen_random_uuid()::text, '-', '')
WHERE access_token IS NULL
  AND COALESCE(no_form_required, false) = false;

COMMENT ON COLUMN public.clients.stage_feedback_sent IS 'Etapa: pesquisa de satisfação enviada.';
COMMENT ON COLUMN public.clients.stage_feedback_posted IS 'Etapa: pesquisa de satisfação postada.';
COMMENT ON COLUMN public.clients.stage_ready_to_archive IS 'Etapa: pronto para arquivar; remete para processos concluídos.';
COMMENT ON COLUMN public.clients.passport_expiration_date IS 'Data de validade do passaporte do cliente.';
COMMENT ON COLUMN public.feedbacks.instagram_usuario IS 'Usuário do Instagram informado pelo cliente para marcação opcional na postagem.';
