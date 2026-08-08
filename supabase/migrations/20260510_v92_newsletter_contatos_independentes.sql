-- V92 — Newsletter com contatos independentes

-- Campos auxiliares de compatibilidade para priorização quando houver grupos familiares/processos.
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_group_leader boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_process_leader boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_main_applicant boolean DEFAULT false;

-- Tabela própria e independente para contatos de newsletter/campanhas.
CREATE TABLE IF NOT EXISTS public.newsletter_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_normalized text NOT NULL UNIQUE,
  nome text,
  telefone text,
  origem text DEFAULT 'clientes_visto',
  status text DEFAULT 'active',
  aceita_newsletter boolean DEFAULT true,
  cliente_origem_id uuid,
  quantidade_clientes_vinculados integer DEFAULT 1,
  nomes_clientes_vinculados text,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  ultimo_envio_em timestamp with time zone,
  descadastrado_em timestamp with time zone,
  motivo_descadastro text,
  observacoes text
);

CREATE INDEX IF NOT EXISTS newsletter_contacts_status_idx ON public.newsletter_contacts(status);
CREATE INDEX IF NOT EXISTS newsletter_contacts_origem_idx ON public.newsletter_contacts(origem);

-- Lista congelada por campanha.
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  newsletter_contact_id uuid REFERENCES public.newsletter_contacts(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  email text NOT NULL,
  email_normalized text NOT NULL,
  name text,
  status text DEFAULT 'pending',
  sent_at timestamp with time zone,
  error text,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS campaign_recipients_campaign_email_unique
ON public.campaign_recipients(campaign_id, email_normalized);

CREATE INDEX IF NOT EXISTS campaign_recipients_status_idx ON public.campaign_recipients(status);

-- Garante campos básicos da V89.
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS newsletter_opt_out boolean DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS newsletter_opt_out_at timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS newsletter_unsubscribe_token uuid DEFAULT gen_random_uuid();

-- Importa clientes atuais para newsletter_contacts, eliminando duplicidade por email.
WITH valid_clients AS (
  SELECT
    c.*,
    lower(trim(c.email)) AS email_norm,
    (
      CASE WHEN COALESCE(c.is_group_leader,false) OR COALESCE(c.is_process_leader,false) OR COALESCE(c.grupo_familiar_master,false) OR COALESCE(c.is_primary,false) OR COALESCE(c.is_main_applicant,false) THEN 1000000 ELSE 0 END
      + CASE WHEN c.birth_date IS NOT NULL THEN (3000000000 - EXTRACT(EPOCH FROM c.birth_date::timestamp)) / 1000000 ELSE 0 END
      + CASE WHEN c.visa_result = 'approved' THEN 200 ELSE 0 END
      + CASE WHEN c.is_completed THEN 100 ELSE 0 END
      + CASE WHEN c.created_at IS NOT NULL THEN (10000000000 - EXTRACT(EPOCH FROM c.created_at)) / 100000000 ELSE 0 END
    ) AS priority_score
  FROM public.clients c
  WHERE c.email IS NOT NULL AND trim(c.email) <> ''
),
chosen AS (
  SELECT DISTINCT ON (email_norm)
    id, name, email, email_norm, phone, newsletter_opt_out, newsletter_opt_out_at
  FROM valid_clients
  ORDER BY email_norm, priority_score DESC
),
agg AS (
  SELECT
    email_norm,
    count(*) AS qtd,
    string_agg(name, ', ' ORDER BY birth_date NULLS LAST, created_at NULLS LAST) AS nomes
  FROM valid_clients
  GROUP BY email_norm
)
INSERT INTO public.newsletter_contacts (
  email,
  email_normalized,
  nome,
  telefone,
  origem,
  status,
  aceita_newsletter,
  cliente_origem_id,
  quantidade_clientes_vinculados,
  nomes_clientes_vinculados,
  descadastrado_em
)
SELECT
  ch.email,
  ch.email_norm,
  ch.name,
  ch.phone,
  'clientes_visto',
  CASE WHEN ch.newsletter_opt_out THEN 'unsubscribed' ELSE 'active' END,
  NOT COALESCE(ch.newsletter_opt_out,false),
  ch.id,
  ag.qtd,
  ag.nomes,
  ch.newsletter_opt_out_at
FROM chosen ch
JOIN agg ag ON ag.email_norm = ch.email_norm
ON CONFLICT (email_normalized) DO UPDATE SET
  nome = COALESCE(newsletter_contacts.nome, EXCLUDED.nome),
  telefone = COALESCE(newsletter_contacts.telefone, EXCLUDED.telefone),
  quantidade_clientes_vinculados = EXCLUDED.quantidade_clientes_vinculados,
  nomes_clientes_vinculados = EXCLUDED.nomes_clientes_vinculados,
  atualizado_em = now();
