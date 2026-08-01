-- =============================================================
-- RESUMINDO VIAGENS — ATUALIZAÇÃO V4.6
-- Orientação inicial sem aparência de chatbox, nome obrigatório,
-- contatos opcionais e relatório após WhatsApp ou inatividade.
-- Execute no SQL Editor do mesmo projeto Supabase usado pelo site.
-- Este script é idempotente.
-- =============================================================

alter table public.chat_sessions add column if not exists visitor_phone text;
alter table public.chat_sessions add column if not exists visitor_email text;
alter table public.chat_sessions add column if not exists report_reason text;

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

revoke all on function public.create_guidance_session(uuid,text,text,text,text) from public, anon;
revoke all on function public.touch_guidance_session(uuid) from public, anon;
grant execute on function public.create_guidance_session(uuid,text,text,text,text) to authenticated;
grant execute on function public.touch_guidance_session(uuid) to authenticated;

insert into public.chat_settings(key,value,updated_at)
values (
  'welcome_message',
  '"Olá! Esta é a orientação inicial da Resumindo Viagens. Escreva livremente sua dúvida geral."'::jsonb,
  now()
)
on conflict(key) do update set value=excluded.value,updated_at=excluded.updated_at;

select
  'ATUALIZAÇÃO V4.6 CONCLUÍDA' as resultado,
  exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='chat_sessions' and column_name='visitor_phone'
  ) as telefone_criado,
  exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='chat_sessions' and column_name='visitor_email'
  ) as email_criado;
