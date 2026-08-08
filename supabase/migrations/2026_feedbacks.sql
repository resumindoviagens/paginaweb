create table if not exists feedbacks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  tipo_feedback text,
  nota_nps integer,
  ponto_forte text,
  comentario text,
  autorizou_divulgacao boolean default false,
  ip text,
  user_agent text,
  created_at timestamp default now()
);