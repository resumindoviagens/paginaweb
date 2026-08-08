-- V85 — Unificação operacional dos emails e marco de limpeza de alertas

CREATE TABLE IF NOT EXISTS public.admin_alert_dismissals (
  alert_key text PRIMARY KEY,
  dismissed_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.admin_alert_dismissals (alert_key, dismissed_at)
VALUES ('bulk-clear-alerts-before-v85', now())
ON CONFLICT (alert_key) DO UPDATE SET dismissed_at = excluded.dismissed_at;
