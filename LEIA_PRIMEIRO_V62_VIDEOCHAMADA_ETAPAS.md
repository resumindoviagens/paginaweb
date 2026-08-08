# V62 — Videochamada nas etapas e ajustes

## Alterações

1. Novas etapas entre Datas agendadas e Entrevista realizada:
   - Videochamada agendada;
   - Videochamada realizada.

2. Termômetro atualizado com as novas etapas.

3. Cadastros antigos:
   - quem já estava em Entrevista realizada ou etapa posterior terá as duas novas etapas marcadas automaticamente pelo SQL.

4. Datas agendadas:
   - ao preencher CASV, entrevista, ou ambos, a etapa `Datas agendadas` é marcada automaticamente.

5. Resultado do visto:
   - `Visto aprovado ou negado` não deve ser sincronizado pelo líder do grupo.

6. Validade do visto:
   - continua individual, sem vínculo com líder do grupo.

7. Instruções Foto:
   - botão liberado novamente.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v62_videochamada_etapas_ajustes.sql`
