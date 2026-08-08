-- V108 — Passageiro manual vira cliente quando tiver dados básicos

ALTER TABLE public.travel_trip_passengers ADD COLUMN IF NOT EXISTS reservation_name text;
ALTER TABLE public.travel_trip_passengers ADD COLUMN IF NOT EXISTS customer_link_status text DEFAULT 'pending'; -- linked | created | temporary | pending
ALTER TABLE public.travel_trip_passengers ADD COLUMN IF NOT EXISTS missing_customer_fields text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS travel_trip_passengers_link_status_idx
ON public.travel_trip_passengers(customer_link_status);

-- Ajuda na deduplicação de passageiros pré-cadastrados.
CREATE INDEX IF NOT EXISTS travel_customers_cpf_idx
ON public.travel_customers(cpf);
