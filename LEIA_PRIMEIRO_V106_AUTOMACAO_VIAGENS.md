# V106 — Automação de emails do módulo de viagens

## Inclui

1. Mantém todos os botões manuais de email no cadastro da viagem.
2. Ao criar uma viagem, o sistema tenta enviar automaticamente V01 — Agenda/calendário com ICS.
3. Automação por cron:
   - V08 — uma semana antes;
   - V04 — check-in da ida cerca de 48h antes;
   - V05 — check-in da volta/outro trecho cerca de 48h antes;
   - V06 — dia do voo de ida;
   - V07 — dia do voo de volta/outro trecho.
4. Exibe no cadastro da viagem quais emails já foram enviados e quando.
5. Checkbox por viagem:
   - enviar automaticamente os emails de viagem nas antecedências programadas.
6. Botão administrativo:
   - Rodar automação de viagens agora.
7. Rota cron:
   - /api/cron/travel-automation

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260511_v106_automacao_emails_viagens.sql

## Configuração Vercel Cron sugerida

Agendar uma execução diária para:

/api/cron/travel-automation

Sugestão: rodar de manhã.

## Atenção

A automação respeita os campos de data/hora da viagem e não envia novamente email já marcado como enviado.
