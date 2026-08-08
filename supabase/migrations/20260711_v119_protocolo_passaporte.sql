-- V119 — protocolo individual do processo de Passaporte
-- O protocolo pertence a cada solicitante e não deve ser sincronizado no grupo familiar.
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS passport_protocol text;

COMMENT ON COLUMN public.clients.passport_protocol IS
'Protocolo individual da solicitação de passaporte na Polícia Federal.';
