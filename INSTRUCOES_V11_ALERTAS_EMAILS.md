# V11 — alertas, checklist de emails e envio automático

Esta versão reativa o envio automático por Brevo, mantém os modelos de copiar e adiciona alertas de datas.

## Variáveis de ambiente necessárias na Vercel

- `BREVO_API_KEY`
- `EMAIL_FROM` (ex: contato@resumindoviagens.com.br)
- `EMAIL_FROM_NAME` (opcional: Resumindo Viagens)
- `EMAIL_REPLY_TO` (opcional)

## Campos novos no Supabase

Para os alertas funcionarem, execute no SQL Editor do Supabase:

```sql
alter table clients add column if not exists interview_date date;
alter table clients add column if not exists casv_date date;
alter table clients add column if not exists video_call_date date;
alter table clients add column if not exists consulate_city text;
```

## Observações

- Os emails 05 e 06 aparecem como **não disponíveis** no envio automático.
- O checklist de emails usa o log `audit_logs` e marca automaticamente os modelos já enviados via Brevo.
- Os modelos para copiar continuam disponíveis.
