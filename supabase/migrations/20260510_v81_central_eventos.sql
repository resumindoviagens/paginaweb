-- V81 — Central de Eventos assistida
CREATE TABLE IF NOT EXISTS public.event_dismissals (
  event_key text PRIMARY KEY,
  event_type text,
  client_id uuid,
  action text,
  dismissed_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_dismissals_client_idx ON public.event_dismissals (client_id);
CREATE TABLE IF NOT EXISTS public.event_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid,
  event_type text,
  action text,
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.admin_alert_dismissals (
  alert_key text PRIMARY KEY,
  dismissed_at timestamp with time zone DEFAULT now()
);
