-- V104 — Viagem como centro do cadastro

ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS organizer_name text;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS organizer_email text;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS organizer_phone text;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS organizer_is_passenger boolean DEFAULT false;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS email_recipient_mode text DEFAULT 'all'; -- organizer | passengers | all
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS passenger_count integer DEFAULT 1;

-- Garante colunas da V102, caso ainda não tenham sido aplicadas.
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS booking_locator text;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS return_booking_locator text;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS calendar_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS offer_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS checkin_outbound_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS checkin_return_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS airport_outbound_email_sent_at timestamp with time zone;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS airport_return_email_sent_at timestamp with time zone;

CREATE TABLE IF NOT EXISTS public.travel_trip_passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_trip_id uuid REFERENCES public.travel_trips(id) ON DELETE CASCADE,
  travel_customer_id uuid REFERENCES public.travel_customers(id) ON DELETE SET NULL,
  passenger_order integer NOT NULL DEFAULT 1,
  name text NOT NULL,
  email text,
  phone text,
  cpf text,
  birth_date date,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS travel_trip_passengers_trip_idx ON public.travel_trip_passengers(travel_trip_id);
CREATE INDEX IF NOT EXISTS travel_trip_passengers_customer_idx ON public.travel_trip_passengers(travel_customer_id);

-- Migra viagens antigas para o novo modelo: cria passageiro a partir do antigo cliente da viagem.
INSERT INTO public.travel_trip_passengers (
  travel_trip_id,
  travel_customer_id,
  passenger_order,
  name,
  email,
  phone,
  cpf,
  birth_date,
  is_primary
)
SELECT
  t.id,
  tc.id,
  1,
  tc.name,
  tc.email,
  tc.phone,
  tc.cpf,
  tc.birth_date,
  true
FROM public.travel_trips t
JOIN public.travel_customers tc ON tc.id = t.travel_customer_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.travel_trip_passengers p WHERE p.travel_trip_id = t.id
);

UPDATE public.travel_trips
SET passenger_count = 1
WHERE passenger_count IS NULL;
