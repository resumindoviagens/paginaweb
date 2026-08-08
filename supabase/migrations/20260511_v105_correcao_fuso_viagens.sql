-- V105 — Correção de fuso horário no módulo de viagens

-- Campos de data/hora de viagem passam a ser "timestamp without time zone"
-- para preservar exatamente o horário digitado na passagem/reserva.
-- Ex.: 25/06/2026 01:50 deve continuar 25/06/2026 01:50.

ALTER TABLE public.travel_trips
  ALTER COLUMN outbound_date TYPE timestamp without time zone
  USING outbound_date::timestamp without time zone;

ALTER TABLE public.travel_trips
  ALTER COLUMN return_date TYPE timestamp without time zone
  USING return_date::timestamp without time zone;

ALTER TABLE public.travel_trips
  ALTER COLUMN car_pickup TYPE timestamp without time zone
  USING car_pickup::timestamp without time zone;

ALTER TABLE public.travel_trips
  ALTER COLUMN car_return TYPE timestamp without time zone
  USING car_return::timestamp without time zone;

-- Observação:
-- Registros que já foram salvos com horário errado devem ser revisados uma vez na tela de edição e salvos novamente.
