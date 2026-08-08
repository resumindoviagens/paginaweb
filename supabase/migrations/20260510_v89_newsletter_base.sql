-- V89 — Newsletter base segura

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS newsletter_opt_out boolean DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS newsletter_opt_out_at timestamp with time zone;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS newsletter_unsubscribe_token uuid DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS clients_newsletter_unsubscribe_token_idx
ON public.clients (newsletter_unsubscribe_token);

CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  message text NOT NULL,
  audience text DEFAULT 'eligible_all',
  status text DEFAULT 'draft',
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  email text NOT NULL,
  name text,
  status text DEFAULT 'queued',
  sent_at timestamp with time zone,
  error text,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_recipients_campaign_idx
ON public.newsletter_recipients (campaign_id);
