# V21 — alertas internos, termômetro e etapas do processo

## Supabase
Execute no SQL Editor do Supabase. Pode rodar mesmo se já tiver rodado versões anteriores, pois usa `IF NOT EXISTS`.

```sql
create table if not exists grupos_processo (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  consulate_city text,
  casv_date date,
  interview_date date,
  video_call_date date,
  passport_tracking_code text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table clients add column if not exists group_process_id uuid;
alter table clients add column if not exists no_form_required boolean default false;
alter table clients add column if not exists is_renewal boolean default false;
alter table clients add column if not exists client_sedex_tracking text;
alter table clients add column if not exists is_completed boolean default false;
alter table clients add column if not exists consulate_city text;
alter table clients add column if not exists casv_date date;
alter table clients add column if not exists interview_date date;
alter table clients add column if not exists video_call_date date;
alter table clients add column if not exists passport_tracking_code text;

alter table clients add column if not exists stage_ds160_completed boolean default false;
alter table clients add column if not exists stage_fee_generated boolean default false;
alter table clients add column if not exists stage_fee_paid boolean default false;
alter table clients add column if not exists stage_dates_scheduled boolean default false;
alter table clients add column if not exists stage_interview_done boolean default false;
alter table clients add column if not exists visa_result text;
alter table clients add column if not exists stage_passport_returned boolean default false;
```

## Variáveis de ambiente na Vercel
Confirme/adicionar:

```txt
BREVO_API_KEY=sua-chave-brevo
EMAIL_FROM=contato@resumindoviagens.com.br
EMAIL_FROM_NAME=Resumindo Viagens
EMAIL_REPLY_TO=contato@resumindoviagens.com.br
ALERT_EMAIL_FROM=alertas@resumindoviagens.com.br
ALERT_EMAIL_FROM_NAME=Resumindo Viagens - Alertas
ALERT_EMAIL_TO=contato@resumindoviagens.com.br
ALERT_EMAIL_REPLY_TO=contato@resumindoviagens.com.br
CRON_SECRET=crie-uma-senha-grande
```

## O que mudou
- Emails internos imediatos usam `alertas@resumindoviagens.com.br` como remetente.
- Email imediato quando o cliente inicia o formulário.
- Email imediato quando o cliente conclui definitivamente o formulário.
- Email imediato quando uma data de videochamada é informada/alterada.
- Termômetro de 7 etapas por cliente no admin.
- Botão “Etapas do processo” por cliente.
- Mantidos grupos de processo, alertas globais e email diário.

## Vídeo da página 1 do formulário
O vídeo atual da primeira página do formulário não está armazenado no projeto nem na Vercel. Ele está incorporado por URL externa no código:

`https://i.imgur.com/wCw6196.mp4`

Arquivo onde aparece:

`app/acesso/[token]/page.js`

Trecho do código:

```html
<source src="https://i.imgur.com/wCw6196.mp4" type="video/mp4" />
```
