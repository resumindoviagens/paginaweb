# V65 — Videochamada com horário + modelo/email automático

## Inclui

1. Campo de videochamada com data e hora
   - agora usa data e horário, exemplo:
     `13/05/2026 às 21:00`.

2. Modelo de email novo
   - `06A - Videochamada agendada`.

3. Email automático novo
   - o modelo aparece também em `Enviar emails automáticos`.

4. Texto do email
   - informa que mais uma etapa foi concluída;
   - confirma data e horário;
   - avisa que no horário indicado será enviado link pelo Zoom ou chamada por WhatsApp;
   - informa alternativa em caso de problema técnico.

5. Status da etapa `Enviado`
   - passa a aparecer como:
     `Preencher DS-160`.

6. Correção do erro 401 no salvamento de grupo
   - o Admin passa a ter fallback de salvamento no próprio cliente líder caso a rota do grupo recuse o PATCH.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v65_videochamada_hora_email.sql`
