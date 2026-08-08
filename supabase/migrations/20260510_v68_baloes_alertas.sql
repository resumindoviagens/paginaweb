-- V68 — Balões editáveis e alertas baixáveis

CREATE TABLE IF NOT EXISTS public.form_help_texts (
  field_id text PRIMARY KEY,
  help_text text NOT NULL DEFAULT '',
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_alert_dismissals (
  alert_key text PRIMARY KEY,
  dismissed_at timestamp with time zone DEFAULT now()
);

-- Permissões para uso pelas rotas server-side com service role.
-- RLS pode permanecer conforme política do projeto; as rotas usam supabaseAdmin.
