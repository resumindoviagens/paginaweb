-- V110 — Upload opcional de documentos no formulário do cliente

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumindo-docs', 'resumindo-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- passport | previous_visa | other
  file_name text NOT NULL,
  file_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  extracted_data jsonb DEFAULT '{}'::jsonb,
  extraction_status text DEFAULT 'pending', -- pending | no_ocr | extracted | failed
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_documents_client_idx
ON public.client_documents(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS client_documents_type_idx
ON public.client_documents(document_type);
