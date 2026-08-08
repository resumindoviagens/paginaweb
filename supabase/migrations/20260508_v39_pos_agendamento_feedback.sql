-- V39 — Pós-agendamento, passaporte devolvido e pesquisa de satisfação
-- Execute este arquivo no Supabase > SQL Editor > Run antes do redeploy da Vercel.

-- Corrige o erro:
-- Could not find the 'data_final_processo' column of 'clients' in the schema cache
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_final_processo date;

-- Etapa atual do processo
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS etapa_atual text;

-- Checklist operacional pós-agendamento
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS checklist_pos_agendamento jsonb DEFAULT '{}'::jsonb;

-- Controle de pesquisa de satisfação
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_liberado boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_token text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_token_expires_at timestamp with time zone;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_codigo text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_codigo_expires_at timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS clients_feedback_token_unique_idx
ON public.clients (feedback_token)
WHERE feedback_token IS NOT NULL;

-- Feedbacks dos clientes
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  tipo_feedback text CHECK (tipo_feedback IN ('aprovado', 'negado')) DEFAULT 'aprovado',
  nota_nps integer CHECK (nota_nps >= 0 AND nota_nps <= 10),
  ponto_forte text,
  comentario text,
  autorizou_divulgacao boolean DEFAULT false,
  ip text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedbacks_client_id_idx
ON public.feedbacks (client_id);

-- Logs internos, caso o projeto ainda não tenha tabela própria de logs
CREATE TABLE IF NOT EXISTS public.client_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_logs_client_id_idx
ON public.client_logs (client_id);

COMMENT ON COLUMN public.clients.data_final_processo IS
'Data de encerramento operacional do processo, preenchida ao marcar passaporte devolvido.';

COMMENT ON COLUMN public.clients.feedback_liberado IS
'Controla se a pesquisa de satisfação foi liberada para o cliente.';

COMMENT ON COLUMN public.clients.feedback_token IS
'Token individual da pesquisa de satisfação.';
