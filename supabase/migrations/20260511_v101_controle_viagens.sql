-- V101 — Administração de Viagens

CREATE TABLE IF NOT EXISTS public.travel_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  cpf text,
  birth_date date,
  alert_email text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS travel_customers_client_idx ON public.travel_customers(client_id);
CREATE INDEX IF NOT EXISTS travel_customers_email_idx ON public.travel_customers(email);

CREATE TABLE IF NOT EXISTS public.travel_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_customer_id uuid REFERENCES public.travel_customers(id) ON DELETE CASCADE,
  title text NOT NULL,
  destination text,
  status text DEFAULT 'planejada',
  passengers text,
  services text[] DEFAULT '{}',
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  outbound_date timestamp with time zone,
  outbound_airline text,
  outbound_flight text,
  return_date timestamp with time zone,
  return_airline text,
  return_flight text,
  has_return boolean DEFAULT false,
  hotel_name text,
  hotel_address text,
  hotel_checkin date,
  hotel_checkout date,
  hotel_confirmation text,
  car_company text,
  car_pickup timestamp with time zone,
  car_return timestamp with time zone,
  car_confirmation text,
  insurance_company text,
  insurance_policy text,
  insurance_valid_until date,
  tickets_notes text,
  notes text,
  stage_created boolean DEFAULT true,
  stage_air_issued boolean DEFAULT false,
  stage_hotel_confirmed boolean DEFAULT false,
  stage_insurance_issued boolean DEFAULT false,
  stage_car_confirmed boolean DEFAULT false,
  stage_docs_sent boolean DEFAULT false,
  stage_checkin_available boolean DEFAULT false,
  stage_trip_started boolean DEFAULT false,
  stage_trip_finished boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS travel_trips_customer_idx ON public.travel_trips(travel_customer_id);
CREATE INDEX IF NOT EXISTS travel_trips_outbound_idx ON public.travel_trips(outbound_date);
CREATE INDEX IF NOT EXISTS travel_trips_return_idx ON public.travel_trips(return_date);

-- Clientes já existentes no módulo de vistos/passaportes ficam disponíveis no módulo viagens.
INSERT INTO public.travel_customers (client_id, name, email, phone, cpf, birth_date, notes)
SELECT c.id, c.name, c.email, c.phone, c.cpf, c.birth_date, 'Importado automaticamente do módulo de vistos/passaportes'
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.travel_customers tc WHERE tc.client_id = c.id
);
