# V114 — V113 + CASV / Videochamada 20 dias

## Inclui tudo da V113

- Importador de dados extraídos pelo ChatGPT na gestão de viagens.
- Anexos temporários no editor de email, pensado para CONFIRMATION, APPLICATION e AGENDAMENTO no email 05.

## Nova automação CASV

Ao informar/alterar a data do CASV em “Datas do cliente”:

1. O sistema NÃO envia email de agenda imediatamente.
2. No cron diário `/api/alerts/daily`, o sistema envia para `contato@resumindoviagens.com.br` um email com `.ics`.
3. O compromisso do `.ics` é:
   - MARCAR DATA VIDEOCHAMADA
   - 20 dias antes da data do CASV
   - 09h00
4. O envio ocorre uma única vez por data de CASV.
5. Se a data do CASV for alterada, o sistema envia novo `.ics` no próximo cron diário.

## Alertas

Quando o CASV estiver dentro de 20 dias e ainda não houver `video_call_date`, o alerta diário passa a mostrar:

MARCAR DATA VIDEOCHAMADA com cliente

Também aparece no painel de alertas do Admin.

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260511_v114_casv_videochamada_20dias.sql
