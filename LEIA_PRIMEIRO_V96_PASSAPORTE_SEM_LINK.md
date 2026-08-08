# V96 — Correção Passaporte sem link + CPF duplicado por processo

## Corrige

1. Processo do tipo `Passaporte` não gera mais link de formulário.
   - access_token = null
   - no_form_required = true

2. Remove a trava `clients_cpf_key`, que impedia criar novo processo para o mesmo CPF.
   - Agora o mesmo cliente pode ter Passaporte e depois Visto.

3. O painel deixa claro que Passaporte é cadastro de controle obrigatório.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v96_passaporte_sem_link_cpf_duplicado.sql`

Se ainda não executou a V95, execute também:

`supabase/migrations/20260510_v95_servico_passaporte.sql`
