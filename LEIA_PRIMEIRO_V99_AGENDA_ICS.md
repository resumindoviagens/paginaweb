# V99 — Agenda ICS e lembretes automáticos ao cliente

## Inclui

1. Emails de agenda com arquivos .ICS:
   - CASV
   - Consulado
   - compromisso único Recife/Porto Alegre
   - Polícia Federal/passaporte
   - videochamada

2. Cliente:
   - recebe email de agenda com .ICS;
   - recebe lembrete antes do compromisso;
   - renovação não recebe lembrete/agenda de CASV.

3. Resumindo Viagens:
   - recebe apenas email ICS para salvar compromisso na agenda;
   - não recebe lembretes 24h/48h, pois já existe resumo diário de alertas.

4. Eventos duplos:
   - o mesmo email pode levar dois anexos .ICS separados:
     - agendamento-casv.ics
     - agendamento-consulado.ics

5. Automação:
   - ao alterar datas, o sistema marca pendência de email de agenda ao cliente;
   - cron /api/cron/agenda-automation envia pendentes e lembretes;
   - botão temporário “Enviar agendas futuras” no Admin envia para datas futuras ainda não enviadas.

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260511_v99_agenda_ics_alertas_cliente.sql

## Vercel Cron sugerido

Criar cron diário para:

/api/cron/agenda-automation

Se usar CRON_SECRET, chamar com ?secret=SEU_SEGREDO ou configurar header x-cron-secret.
