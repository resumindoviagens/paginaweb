-- V112A — Diagnóstico detalhado da leitura assistida/OCR

ALTER TABLE public.client_documents ADD COLUMN IF NOT EXISTS extraction_error text;
ALTER TABLE public.client_documents ADD COLUMN IF NOT EXISTS extraction_raw text;
ALTER TABLE public.client_documents ADD COLUMN IF NOT EXISTS extraction_model text;
ALTER TABLE public.client_documents ADD COLUMN IF NOT EXISTS extraction_attempted_at timestamp with time zone;
