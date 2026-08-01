-- =============================================================
-- RESUMINDO VIAGENS — ORIENTAÇÃO INICIAL, BASE DE RESPOSTAS E ATENDIMENTO PERSONALIZADO
-- Execute este arquivo uma única vez no SQL Editor do projeto Supabase
-- exclusivo da orientação online. O script é idempotente e pode ser executado novamente.
-- IMPORTANTE: crie antes o usuário administrador em Authentication > Users
-- com o e-mail contato@resumindoviagens.com.br.
-- =============================================================

create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin','agent')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'Geral',
  question text not null,
  variations text[] not null default '{}',
  answer text not null,
  keywords text[] not null default '{}',
  response_mode text not null default 'direct' check (response_mode in ('direct','direct_and_handoff','human_only')),
  whatsapp_on boolean not null default false,
  priority integer not null default 50,
  active boolean not null default true,
  requires_review boolean not null default false,
  valid_until date,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists knowledge_question_unique_idx on public.knowledge_items ((lower(question)));

create table if not exists public.knowledge_versions (
  id bigint generated always as identity primary key,
  knowledge_id uuid not null references public.knowledge_items(id) on delete cascade,
  snapshot jsonb not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key,
  visitor_id uuid not null references auth.users(id) on delete cascade,
  visitor_name text,
  visitor_phone text,
  visitor_email text,
  status text not null default 'bot' check (status in ('bot','waiting_human','human','closed')),
  human_requested boolean not null default false,
  assigned_admin uuid references auth.users(id),
  page_url text,
  started_at timestamptz not null default now(),
  last_activity timestamptz not null default now(),
  ended_at timestamptz,
  report_sent_at timestamptz,
  report_message_id text,
  report_reason text,
  triage_id uuid
);
create index if not exists chat_sessions_last_activity_idx on public.chat_sessions(last_activity desc);
create index if not exists chat_sessions_visitor_idx on public.chat_sessions(visitor_id);
alter table public.chat_sessions add column if not exists report_sent_at timestamptz;
alter table public.chat_sessions add column if not exists report_message_id text;
alter table public.chat_sessions add column if not exists visitor_phone text;
alter table public.chat_sessions add column if not exists visitor_email text;
alter table public.chat_sessions add column if not exists report_reason text;

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  author_id uuid references auth.users(id),
  role text not null check (role in ('user','assistant','system')),
  sender_type text not null check (sender_type in ('visitor','bot','human','system')),
  content text not null check (char_length(content) between 1 and 6000),
  source text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_session_idx on public.chat_messages(session_id,created_at);

create table if not exists public.triage_questions (
  id uuid primary key default gen_random_uuid(),
  question_key text unique not null,
  prompt text not null,
  help_text text,
  input_type text not null default 'choice' check (input_type in ('choice','text','month_year')),
  options jsonb not null default '[]',
  condition_question_key text,
  condition_values text[] not null default '{}',
  sort_order integer not null default 10,
  required boolean not null default true,
  active boolean not null default true,
  include_in_whatsapp boolean not null default true,
  whatsapp_label text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.triage_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique not null references public.chat_sessions(id) on delete cascade,
  visitor_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  summary_text text not null,
  reference_code text unique not null,
  visitor_name text,
  contact_phone text,
  contact_preference text,
  contact_consent boolean not null default false,
  continuation_mode text not null default 'undecided',
  contact_status text not null default 'new',
  email_sent_at timestamptz,
  email_message_id text,
  callback_email_sent_at timestamptz,
  callback_email_message_id text,
  contacted_at timestamptz,
  contacted_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.triage_submissions add column if not exists visitor_name text;
alter table public.triage_submissions add column if not exists contact_phone text;
alter table public.triage_submissions add column if not exists contact_preference text;
alter table public.triage_submissions add column if not exists contact_consent boolean not null default false;
alter table public.triage_submissions add column if not exists continuation_mode text not null default 'undecided';
alter table public.triage_submissions add column if not exists contact_status text not null default 'new';
alter table public.triage_submissions add column if not exists email_sent_at timestamptz;
alter table public.triage_submissions add column if not exists email_message_id text;
alter table public.triage_submissions add column if not exists callback_email_sent_at timestamptz;
alter table public.triage_submissions add column if not exists callback_email_message_id text;
alter table public.triage_submissions add column if not exists contacted_at timestamptz;
alter table public.triage_submissions add column if not exists contacted_by uuid references auth.users(id);
alter table public.triage_submissions add column if not exists updated_at timestamptz not null default now();
create index if not exists triage_submissions_code_idx on public.triage_submissions(reference_code);
create index if not exists triage_submissions_status_idx on public.triage_submissions(contact_status,created_at desc);

alter table public.chat_sessions
  drop constraint if exists chat_sessions_triage_id_fkey;
alter table public.chat_sessions
  add constraint chat_sessions_triage_id_fkey foreign key (triage_id) references public.triage_submissions(id) on delete set null;

create table if not exists public.review_queue (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete set null,
  question_message_id bigint references public.chat_messages(id) on delete set null,
  answer_message_id bigint references public.chat_messages(id) on delete set null,
  proposed_question text not null,
  proposed_answer text not null,
  category text not null default 'Geral',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create or replace function public.is_chat_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.admin_profiles p where p.user_id=auth.uid() and p.active=true);
$$;

create or replace function public.create_chat_session(p_session_id uuid, p_name text default null, p_page_url text default null)
returns uuid language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if exists(select 1 from public.chat_sessions where id=p_session_id and visitor_id<>auth.uid()) then
    raise exception 'session belongs to another visitor';
  end if;
  insert into public.chat_sessions(id,visitor_id,visitor_name,page_url)
  values(p_session_id,auth.uid(),nullif(left(trim(coalesce(p_name,'')),60),''),left(coalesce(p_page_url,''),500))
  on conflict(id) do update set visitor_name=excluded.visitor_name,page_url=excluded.page_url,last_activity=now()
  where public.chat_sessions.visitor_id=auth.uid();
  return p_session_id;
end; $$;

create or replace function public.update_own_chat_name(p_session_id uuid, p_name text)
returns void language plpgsql security definer set search_path=public as $$
begin
  update public.chat_sessions set visitor_name=nullif(left(trim(coalesce(p_name,'')),60),''),last_activity=now()
  where id=p_session_id and visitor_id=auth.uid();
end; $$;


-- V4.6: cria a orientação somente após o nome obrigatório e guarda contatos opcionais.
create or replace function public.create_guidance_session(
  p_session_id uuid,
  p_name text,
  p_page_url text default null,
  p_phone text default null,
  p_email text default null
)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_name text := left(trim(coalesce(p_name,'')),60);
  v_phone text := nullif(left(regexp_replace(coalesce(p_phone,''),'\D','','g'),20),'');
  v_email text := nullif(left(lower(trim(coalesce(p_email,''))),160),'');
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if char_length(v_name) < 2 then raise exception 'name required'; end if;
  if v_phone is not null and char_length(v_phone) < 10 then raise exception 'invalid phone'; end if;
  if v_email is not null and v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid email'; end if;
  if exists(select 1 from public.chat_sessions where id=p_session_id and visitor_id<>auth.uid()) then
    raise exception 'session belongs to another visitor';
  end if;
  insert into public.chat_sessions(id,visitor_id,visitor_name,visitor_phone,visitor_email,page_url)
  values(p_session_id,auth.uid(),v_name,v_phone,v_email,left(coalesce(p_page_url,''),500))
  on conflict(id) do update set
    visitor_name=excluded.visitor_name,
    visitor_phone=excluded.visitor_phone,
    visitor_email=excluded.visitor_email,
    page_url=excluded.page_url,
    last_activity=now()
  where public.chat_sessions.visitor_id=auth.uid() and public.chat_sessions.status<>'closed';
  return p_session_id;
end; $$;

create or replace function public.touch_guidance_session(p_session_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  update public.chat_sessions set last_activity=now()
  where id=p_session_id and visitor_id=auth.uid() and status<>'closed';
end; $$;

create or replace function public.request_chat_human(p_session_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_status text;
begin
  select status into v_status from public.chat_sessions where id=p_session_id and visitor_id=auth.uid();
  if v_status is null or v_status='closed' then raise exception 'session unavailable'; end if;
  if v_status in ('waiting_human','human') then return; end if;
  update public.chat_sessions set status='waiting_human',human_requested=true,last_activity=now() where id=p_session_id and visitor_id=auth.uid();
  insert into public.chat_messages(session_id,role,sender_type,content,source)
  values(p_session_id,'system','system','Seu pedido de atendimento humano foi enviado. Você pode continuar nesta conversa enquanto aguarda.','human-request');
end; $$;

create or replace function public.submit_chat_triage(p_session_id uuid,p_answers jsonb,p_summary text,p_reference_code text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  if not exists(select 1 from public.chat_sessions where id=p_session_id and visitor_id=auth.uid() and status<>'closed') then
    raise exception 'session unavailable';
  end if;
  insert into public.triage_submissions(session_id,visitor_id,answers,summary_text,reference_code)
  values(p_session_id,auth.uid(),p_answers,left(p_summary,10000),left(p_reference_code,20))
  on conflict(session_id) do update set answers=excluded.answers,summary_text=excluded.summary_text,reference_code=excluded.reference_code
  returning id into v_id;
  update public.chat_sessions set triage_id=v_id,last_activity=now() where id=p_session_id;
  insert into public.chat_messages(session_id,role,sender_type,content,source)
  values(p_session_id,'system','system','Triagem concluída. Código: '||left(p_reference_code,20)||E'\n\n'||left(p_summary,5000),'triage') ;
  return v_id;
end; $$;

create or replace function public.snapshot_knowledge()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='UPDATE' then
    insert into public.knowledge_versions(knowledge_id,snapshot,changed_by) values(old.id,to_jsonb(old),auth.uid());
    new.updated_at=now(); new.updated_by=auth.uid();
  end if;
  return new;
end; $$;
drop trigger if exists knowledge_snapshot_trigger on public.knowledge_items;
create trigger knowledge_snapshot_trigger before update on public.knowledge_items for each row execute function public.snapshot_knowledge();

-- RLS
alter table public.admin_profiles enable row level security;
alter table public.chat_settings enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.knowledge_versions enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.triage_questions enable row level security;
alter table public.triage_submissions enable row level security;
alter table public.review_queue enable row level security;

-- Policies, recreated safely
do $$ declare r record; begin
  for r in select schemaname,tablename,policyname from pg_policies where schemaname='public' and tablename in ('admin_profiles','chat_settings','knowledge_items','knowledge_versions','chat_sessions','chat_messages','triage_questions','triage_submissions','review_queue') loop
    execute format('drop policy if exists %I on %I.%I',r.policyname,r.schemaname,r.tablename);
  end loop;
end $$;

create policy admin_profiles_self on public.admin_profiles for select to authenticated using (user_id=auth.uid() or public.is_chat_admin());
create policy settings_read on public.chat_settings for select to authenticated using (true);
create policy settings_admin_all on public.chat_settings for all to authenticated using (public.is_chat_admin()) with check (public.is_chat_admin());
create policy knowledge_admin_read on public.knowledge_items for select to authenticated using (public.is_chat_admin());
create policy knowledge_admin_all on public.knowledge_items for all to authenticated using (public.is_chat_admin()) with check (public.is_chat_admin());
create policy knowledge_versions_admin on public.knowledge_versions for select to authenticated using (public.is_chat_admin());
create policy sessions_own_read on public.chat_sessions for select to authenticated using (visitor_id=auth.uid() or public.is_chat_admin());
create policy sessions_admin_update on public.chat_sessions for update to authenticated using (public.is_chat_admin()) with check (public.is_chat_admin());
create policy messages_own_read on public.chat_messages for select to authenticated using (public.is_chat_admin() or exists(select 1 from public.chat_sessions s where s.id=session_id and s.visitor_id=auth.uid()));
create policy messages_admin_insert on public.chat_messages for insert to authenticated with check (public.is_chat_admin() and sender_type in ('human','system'));
create policy triage_questions_read on public.triage_questions for select to authenticated using (active=true or public.is_chat_admin());
create policy triage_questions_admin on public.triage_questions for all to authenticated using (public.is_chat_admin()) with check (public.is_chat_admin());
create policy triage_submissions_own on public.triage_submissions for select to authenticated using (visitor_id=auth.uid() or public.is_chat_admin());
create policy triage_submissions_admin_update on public.triage_submissions for update to authenticated using (public.is_chat_admin()) with check (public.is_chat_admin());
create policy review_admin_all on public.review_queue for all to authenticated using (public.is_chat_admin()) with check (public.is_chat_admin());

-- Grants
grant usage on schema public to authenticated;
grant select on public.admin_profiles,public.chat_settings,public.knowledge_items,public.knowledge_versions,public.chat_sessions,public.chat_messages,public.triage_questions,public.triage_submissions to authenticated;
grant update on public.triage_submissions to authenticated;
grant insert,update,delete on public.chat_settings,public.knowledge_items,public.triage_questions,public.review_queue to authenticated;
grant select,insert,update,delete on public.review_queue to authenticated;
grant update on public.chat_sessions to authenticated;
grant insert on public.chat_messages to authenticated;
grant usage,select on all sequences in schema public to authenticated;

revoke all on function public.is_chat_admin() from public, anon;
revoke all on function public.create_chat_session(uuid,text,text) from public, anon;
revoke all on function public.update_own_chat_name(uuid,text) from public, anon;
revoke all on function public.create_guidance_session(uuid,text,text,text,text) from public, anon;
revoke all on function public.touch_guidance_session(uuid) from public, anon;
revoke all on function public.request_chat_human(uuid) from public, anon;
revoke all on function public.submit_chat_triage(uuid,jsonb,text,text) from public, anon;

grant execute on function public.is_chat_admin() to authenticated;
grant execute on function public.create_chat_session(uuid,text,text) to authenticated;
grant execute on function public.update_own_chat_name(uuid,text) to authenticated;
grant execute on function public.create_guidance_session(uuid,text,text,text,text) to authenticated;
grant execute on function public.touch_guidance_session(uuid) to authenticated;
grant execute on function public.request_chat_human(uuid) to authenticated;
grant execute on function public.submit_chat_triage(uuid,jsonb,text,text) to authenticated;

-- Primeiro administrador: o usuário precisa existir antes no Supabase Auth.
insert into public.admin_profiles(user_id,email,role,active)
select id,email,'admin',true from auth.users where lower(email)=lower('contato@resumindoviagens.com.br')
on conflict(user_id) do update set email=excluded.email,role='admin',active=true;

-- Configurações iniciais
insert into public.chat_settings(key,value) values
('human_available','false'::jsonb),
('whatsapp_number','"5511981210932"'::jsonb),
('welcome_message','"Olá! Esta é a orientação inicial da Resumindo Viagens. Escreva livremente sua dúvida geral."'::jsonb),
('retention_days','90'::jsonb)
on conflict(key) do nothing;

-- Dez respostas aprovadas
insert into public.knowledge_items(category,question,variations,answer,keywords,response_mode,whatsapp_on,priority,active,requires_review)
values
('Institucional','Quais serviços a Resumindo Viagens oferece?',array['O que a Resumindo Viagens faz?','Quais são os serviços de vocês?','Como a Resumindo pode me ajudar?'],
'A Resumindo Viagens nasceu da vontade de ajudar pessoas a realizarem sonhos e chegarem a lugares que talvez nunca imaginaram conhecer. Somos uma assessoria especializada em vistos e planejamento de viagens. Ajudamos em processos como primeiro visto americano e renovação, visto canadense e eTA, emissão de passaporte, seguro viagem, passagens, hotéis, casas em Orlando, locação de veículos, roteiros personalizados e apoio a quem mora fora do Brasil. Nosso trabalho é orientar com clareza, organizar cada etapa e simplificar processos que costumam gerar insegurança, sempre com discrição e atendimento próximo.',
array['serviços','assessoria','viagem','vistos','passaporte'], 'direct',false,100,true,false),

('Visto americano','Como funciona a assessoria para o primeiro visto americano?',array['Quero tirar o visto americano pela primeira vez','Vocês ajudam no primeiro visto?','Ainda não tenho passaporte, posso começar?'],
'Para solicitar o visto americano pela primeira vez, o primeiro passo é ter o passaporte válido. Mesmo que ele ainda não esteja em mãos, já é possível iniciar a assessoria e adiantar parte das informações. Organizamos os dados fornecidos, preenchemos o DS-160, orientamos sobre documentos e vínculos com o Brasil, auxiliamos na taxa consular e no agendamento. Também realizamos uma videochamada personalizada para tratar de profissão, situação econômica, eventual negativa anterior, crianças, postura, vestimenta e outras dúvidas específicas. O atendimento é individualizado, sem promessa de aprovação, com foco em clareza, preparação e tranquilidade.',
array['primeiro visto','DS-160','entrevista','videochamada'], 'direct',false,100,true,false),

('Visto americano','Como funciona a renovação do visto americano?',array['Meu visto venceu, vocês fazem renovação?','Posso renovar meu visto?','Quando o visto é considerado renovação?'],
'A renovação pode ser um processo mais simples, mas primeiro avaliamos se o caso realmente se enquadra nos requisitos aplicáveis, considerando fatores como o período desde o vencimento e a situação do solicitante quando o visto anterior foi emitido. Confirmada a possibilidade, enviamos o formulário inteligente, orientamos detalhadamente sobre a foto, organizamos passaporte atual, passaporte anterior com o visto e as etapas de taxa, agendamento, entrega e devolução. Quando não for hipótese de renovação, podemos conduzir o processo completo com nova entrevista e a mesma preparação oferecida ao primeiro visto. Para uma triagem inicial, informe apenas o mês e o ano em que o visto venceu ou vencerá, sem enviar números de documentos.',
array['renovação','visto vencido','passaporte anterior','CASV'], 'direct_and_handoff',true,100,true,true),

('Visto americano','Vocês apenas preenchem o DS-160 ou também ajudam na entrevista?',array['O serviço inclui entrevista?','Vocês preenchem o formulário em inglês?','Tem videochamada?'],
'Não fazemos apenas o preenchimento do DS-160. As informações fornecidas pelo solicitante são organizadas e inseridas em inglês com atenção à clareza e à coerência. Damos suporte etapa por etapa, esclarecemos dúvidas ao longo do preenchimento, auxiliamos no agendamento e realizamos uma videochamada de preparação. Nessa conversa revisamos o procedimento, documentos, postura, organização e pontos de atenção específicos do caso.',
array['DS-160','inglês','entrevista','videochamada','agendamento'], 'direct',false,95,true,false),

('Visto americano','Contratando a assessoria, meu visto será aprovado?',array['Vocês garantem aprovação?','A assessoria garante o visto?','É certeza que meu visto será aprovado?'],
'A assessoria é um serviço de meio, e não de resultado. Isso significa que trabalhamos para preparar o processo da melhor forma possível, com organização, análise, preenchimento e orientação, mas a decisão final pertence exclusivamente à autoridade consular. Nosso compromisso é atuar com técnica, responsabilidade, clareza e segurança, sem criar informações e sem prometer aprovação.',
array['garantia','aprovação','serviço de meio'], 'direct',false,100,true,false),

('Visto americano','Meu visto foi negado. Vocês conseguem descobrir o motivo e ajudar?',array['Tive o visto recusado','Por que meu visto foi negado?','Posso tentar de novo depois da negativa?'],
'A negativa nem sempre vem acompanhada do motivo exato, por isso não é possível afirmar com certeza o que levou à decisão. Ainda assim, podemos analisar o formulário anterior, o perfil informado e, quando possível, a dinâmica da entrevista e o momento em que ela foi interrompida. Isso pode indicar fatores que possivelmente contribuíram para a recusa e orientar uma nova solicitação, apresentando as informações com mais clareza. A avaliação é individual e não garante resultado. Para começar, informe apenas em que ano ocorreu a negativa e, de forma geral, como foi a entrevista, sem compartilhar dados pessoais.',
array['negativa','recusa','visto negado','nova tentativa'], 'direct_and_handoff',true,100,true,true),

('Visto americano','Criança precisa comparecer ao consulado?',array['Menor de 14 anos precisa ir?','Criança vai ao CASV?','Adolescente precisa comparecer?'],
'A necessidade de comparecimento depende da idade, do tipo de solicitação e das regras consulares vigentes na data do processo. Crianças menores podem seguir procedimento diferente de adolescentes e adultos, e a presença de um responsável pode ser necessária. Verificamos o procedimento aplicável e orientamos sobre foto, documentos e organização. Para uma orientação inicial, informe a idade da criança e se os pais possuem visto americano válido. Como essas regras podem mudar, a confirmação final precisa ser feita no momento do atendimento.',
array['criança','menor','adolescente','CASV','consulado'], 'direct_and_handoff',true,90,true,true),

('Visto americano','Quanto tempo leva para preencher o formulário e deixar tudo pronto?',array['Qual o prazo do processo?','Quanto demora o DS-160?','Quando consigo agendar?'],
'O prazo depende do envio completo das informações, da situação do passaporte, do pagamento da taxa consular e da disponibilidade de agendamento na cidade escolhida. Depois de recebermos os dados necessários, organizamos o DS-160 e orientamos sobre a foto; somente após as etapas de pagamento é possível avançar ao agendamento. As datas disponíveis e a devolução do passaporte variam conforme local, período e regras oficiais. Por isso, o prazo exato deve ser verificado no momento da contratação.',
array['prazo','tempo','agendamento','taxa consular'], 'direct_and_handoff',true,95,true,true),

('Canadá','Vocês fazem visto canadense e eTA?',array['Como funciona o eTA?','Vocês tiram visto do Canadá?','Qual a diferença entre eTA e visto canadense?'],
'Sim. Auxiliamos tanto em processos de visto canadense quanto em pedidos de eTA para viajantes que se enquadrem nas regras aplicáveis. A eTA é uma autorização eletrônica ligada ao passaporte e destinada a situações específicas de entrada aérea; ela não substitui o visto em todos os casos. Como a elegibilidade depende de nacionalidade, passaporte, histórico de viagem e regras vigentes, primeiro avaliamos qual caminho é adequado ao perfil do solicitante.',
array['Canadá','ETA','visto canadense'], 'direct_and_handoff',true,90,true,true),

('Planejamento de viagem','Vocês fazem apenas visto ou também planejam a viagem?',array['Vocês vendem passagens?','Fazem hotel e seguro?','Ajudam com roteiro e carro?'],
'Além da assessoria de vistos, realizamos serviços de agência e planejamento de viagem, independentemente da contratação do visto. Podemos pesquisar passagens, auxiliar no roteiro e na programação, contratar seguro viagem, hotéis, casas, locação de veículos e outras soluções conforme a necessidade do viajante. As cotações e disponibilidades dependem do destino, das datas, do perfil dos viajantes e do orçamento.',
array['planejamento','passagens','hotel','seguro','carro','roteiro'], 'direct_and_handoff',true,95,true,false)
on conflict do nothing;

-- Perguntas de triagem iniciais
insert into public.triage_questions(question_key,prompt,help_text,input_type,options,condition_question_key,condition_values,sort_order,required,active,include_in_whatsapp,whatsapp_label)
values
('service_type','Qual atendimento você procura?','Escolha a opção mais próxima do seu caso.','choice','[{"value":"first_visa","label":"Primeiro visto americano"},{"value":"renewal","label":"Renovação"},{"value":"denial","label":"Orientação após negativa"},{"value":"unsure","label":"Ainda não sei"}]',null,'{}',10,true,true,true,'Serviço desejado'),
('passport_status','Você já possui passaporte válido?',null,'choice','[{"value":"valid","label":"Sim"},{"value":"issuing","label":"Está em processo de emissão"},{"value":"none","label":"Ainda não tenho"}]',null,'{}',20,true,true,true,'Passaporte'),
('applicants','O atendimento será para quantas pessoas?',null,'choice','[{"value":"1","label":"Somente uma pessoa"},{"value":"2","label":"Duas pessoas"},{"value":"3","label":"Três pessoas"},{"value":"4plus","label":"Quatro ou mais"}]',null,'{}',30,true,true,true,'Quantidade de solicitantes'),
('minors','Há crianças ou adolescentes entre os solicitantes?',null,'choice','[{"value":"none","label":"Não"},{"value":"under14","label":"Menores de 14 anos"},{"value":"14plus","label":"A partir de 14 anos"},{"value":"both","label":"Há pessoas nas duas faixas"}]',null,'{}',40,true,true,true,'Crianças/adolescentes'),
('previous_visa','Qual é a situação do visto americano anterior?',null,'choice','[{"value":"never","label":"Nunca tive visto"},{"value":"valid","label":"Ainda está válido"},{"value":"expired","label":"Está vencido"},{"value":"unknown","label":"Não sei informar"}]',null,'{}',50,true,true,true,'Visto anterior'),
('expiry','Em qual mês e ano o visto venceu ou vencerá?','Digite apenas mês e ano, por exemplo: 05/2026.','month_year','[]','previous_visa',array['valid','expired'],60,true,true,true,'Vencimento do visto'),
('age_at_issue','Quando esse visto foi emitido, o solicitante era menor de 14 anos?',null,'choice','[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"},{"value":"unknown","label":"Não sei informar"}]','service_type',array['renewal'],70,true,true,true,'Menor de 14 anos na emissão'),
('denied','Já houve alguma negativa de visto americano?',null,'choice','[{"value":"no","label":"Não"},{"value":"yes","label":"Sim"},{"value":"private","label":"Prefiro explicar à equipe"}]',null,'{}',80,true,true,true,'Negativa anterior'),
('denial_year','Em que ano ocorreu a negativa?','Não descreva documentos ou dados pessoais.','text','[]','denied',array['yes'],90,true,true,true,'Ano da negativa'),
('city_state','Em qual cidade e estado você mora?','Exemplo: Campinas/SP. Não informe endereço.','text','[]',null,'{}',100,false,true,true,'Cidade/UF')
on conflict(question_key) do nothing;

-- Realtime: adiciona as tabelas caso ainda não estejam na publicação.
do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='chat_sessions') then alter publication supabase_realtime add table public.chat_sessions; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='chat_messages') then alter publication supabase_realtime add table public.chat_messages; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='triage_submissions') then alter publication supabase_realtime add table public.triage_submissions; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='chat_settings') then alter publication supabase_realtime add table public.chat_settings; end if;
end $$;

select 'CONFIGURAÇÃO CONCLUÍDA' as resultado,
       (select count(*) from public.knowledge_items) as respostas,
       (select count(*) from public.triage_questions) as perguntas_triagem,
       (select count(*) from public.admin_profiles) as administradores;
