-- V83 — Condicionais do formulário e marco de limpeza dos alertas antigos

CREATE TABLE IF NOT EXISTS public.admin_alert_dismissals (
  alert_key text PRIMARY KEY,
  dismissed_at timestamp with time zone DEFAULT now()
);

-- Marco simbólico para começar a auditoria de alertas do zero a partir desta atualização.
INSERT INTO public.admin_alert_dismissals (alert_key, dismissed_at)
VALUES ('bulk-clear-alerts-before-v83', now())
ON CONFLICT (alert_key) DO UPDATE SET dismissed_at = excluded.dismissed_at;
