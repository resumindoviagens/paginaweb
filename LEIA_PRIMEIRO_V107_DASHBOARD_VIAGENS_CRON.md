# V107 — Dashboard de Viagens + Cron Automático

## Inclui

1. Dashboard no topo do módulo Administração de Viagens:
   - viagens ativas;
   - embarques hoje;
   - check-ins dentro da janela;
   - viagens sem localizador;
   - hotel pendente;
   - seguro pendente;
   - emails enviados nas últimas 24h.

2. Listas rápidas:
   - embarques hoje;
   - check-in na janela;
   - falta localizador;
   - emails recentes.

3. Automação já configurada no `vercel.json`:
   - /api/cron/travel-automation
   - execução diária no mesmo horário do alerta diário.

4. Botão manual continua:
   - Rodar automação de viagens agora.

## SQL

Não há SQL novo se você já executou a V106.

Se ainda não executou a V106, execute:
supabase/migrations/20260511_v106_automacao_emails_viagens.sql
