-- V111 — Cliente único entre Vistos, Passaportes e Viagens

CREATE TABLE IF NOT EXISTS public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  reservation_name text,
  cpf text,
  birth_date date,
  email text,
  phone text,
  passport_number text,
  passport_issue_date date,
  passport_expiry_date date,
  passport_issuer text,
  passport_country text DEFAULT 'Brasil',
  nationality text DEFAULT 'Brasileira',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS people_cpf_idx ON public.people(cpf);
CREATE INDEX IF NOT EXISTS people_name_idx ON public.people(name);

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.travel_customers ADD COLUMN IF NOT EXISTS person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.travel_trip_passengers ADD COLUMN IF NOT EXISTS person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;

-- Migra clientes de visto/passaporte para cadastro único.
INSERT INTO public.people (name, cpf, birth_date, email, phone, notes)
SELECT c.name, c.cpf, c.birth_date, c.email, c.phone, 'Criado automaticamente a partir do módulo de vistos/passaportes'
FROM public.clients c
WHERE c.person_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM public.people p
  WHERE COALESCE(p.cpf,'') = COALESCE(c.cpf,'')
  AND COALESCE(p.birth_date::text,'') = COALESCE(c.birth_date::text,'')
  AND COALESCE(p.cpf,'') <> ''
);

UPDATE public.clients c
SET person_id = p.id
FROM public.people p
WHERE c.person_id IS NULL
AND COALESCE(p.cpf,'') = COALESCE(c.cpf,'')
AND COALESCE(p.birth_date::text,'') = COALESCE(c.birth_date::text,'')
AND COALESCE(c.cpf,'') <> '';

-- Migra clientes de viagem para cadastro único.
INSERT INTO public.people (name, reservation_name, cpf, birth_date, email, phone, notes)
SELECT tc.name, tc.name, tc.cpf, tc.birth_date, tc.email, tc.phone, 'Criado automaticamente a partir do módulo de viagens'
FROM public.travel_customers tc
WHERE tc.person_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM public.people p
  WHERE COALESCE(p.cpf,'') = COALESCE(tc.cpf,'')
  AND COALESCE(p.birth_date::text,'') = COALESCE(tc.birth_date::text,'')
  AND COALESCE(p.cpf,'') <> ''
);

UPDATE public.travel_customers tc
SET person_id = p.id
FROM public.people p
WHERE tc.person_id IS NULL
AND COALESCE(p.cpf,'') = COALESCE(tc.cpf,'')
AND COALESCE(p.birth_date::text,'') = COALESCE(tc.birth_date::text,'')
AND COALESCE(tc.cpf,'') <> '';

UPDATE public.travel_trip_passengers tp
SET person_id = tc.person_id
FROM public.travel_customers tc
WHERE tp.person_id IS NULL
AND tp.travel_customer_id = tc.id
AND tc.person_id IS NOT NULL;
