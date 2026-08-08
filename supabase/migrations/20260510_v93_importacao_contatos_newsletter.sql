-- V93 — Importação de contatos para Newsletter

ALTER TABLE public.newsletter_contacts
ADD COLUMN IF NOT EXISTS categoria text DEFAULT 'Cliente';

CREATE INDEX IF NOT EXISTS newsletter_contacts_categoria_idx
ON public.newsletter_contacts(categoria);

-- Categorias sugeridas:
-- Cliente, Fornecedor, Parceiro, Governo, Outros
