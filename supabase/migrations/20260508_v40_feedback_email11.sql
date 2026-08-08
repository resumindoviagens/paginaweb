-- V40 — Email 11 / Pesquisa de satisfação real
-- Execute este arquivo no Supabase > SQL Editor > Run antes do redeploy da Vercel.

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS data_final_processo date;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_liberado boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_token text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_token_expires_at timestamp with time zone;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_answered_at timestamp with time zone;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS feedback_nota_nps integer;

CREATE UNIQUE INDEX IF NOT EXISTS clients_feedback_token_unique_idx
ON public.clients (feedback_token)
WHERE feedback_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  tipo_feedback text CHECK (tipo_feedback IN ('aprovado', 'negado')) DEFAULT 'aprovado',
  nota_nps integer CHECK (nota_nps >= 0 AND nota_nps <= 10),
  ponto_forte text,
  comentario text,
  autorizou_divulgacao boolean DEFAULT false,
  nome_publico text,
  cidade_publica text,
  ip text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedbacks_client_id_idx
ON public.feedbacks (client_id);
