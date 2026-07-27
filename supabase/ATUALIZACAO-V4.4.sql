-- RESUMINDO VIAGENS — ATUALIZAÇÃO V4.4
-- Execute no SQL Editor do MESMO Supabase exclusivo do chatbot.
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
drop policy if exists triage_submissions_admin_update on public.triage_submissions;
create policy triage_submissions_admin_update on public.triage_submissions for update to authenticated using (public.is_chat_admin()) with check (public.is_chat_admin());
grant update on public.triage_submissions to authenticated;
select 'ATUALIZAÇÃO V4.4 CONCLUÍDA' as resultado,count(*) as triagens_existentes from public.triage_submissions;
