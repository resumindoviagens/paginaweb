# V48 — Admin: 10 etapas unificadas + sincronização de grupo

## Alterações principais

1. **Data de início do processo**
   - Saiu do cadastro inicial.
   - Saiu do modal Editar dados.
   - Entrou em **Processos, datas e rastreios**.
   - Quando o cliente é líder/master do grupo, a data é gravada no grupo e sincronizada com os demais.

2. **Sincronização de grupo**
   - Não pergunta mais se deve sincronizar quando a alteração é feita pelo líder.
   - Se tentar alterar etapas/datas/rastreios por um membro que não é líder, aparece aviso para usar o líder.
   - O líder sincroniza automaticamente etapas, barra de progresso, datas e rastreios.

3. **Status + etapas viraram 10 etapas únicas**
   - Não iniciado
   - Em preenchimento
   - Enviado
   - DS-160 preenchido e concluído
   - Taxa gerada
   - Taxa paga
   - Datas agendadas
   - Entrevista realizada
   - Visto aprovado ou negado
   - Visto/passaporte devolvido

4. **Filtro**
   - O antigo filtro de Status agora filtra por **Etapa**.

5. **Termômetro**
   - Agora mostra 10 itens.

6. **Marcação inteligente**
   - Ao clicar em uma etapa avançada, todas as etapas anteriores são marcadas automaticamente.
   - Exemplo: clicar em “Datas agendadas” marca automaticamente as etapas anteriores.

7. **Regularização de cadastros antigos**
   - O SQL define `status = submitted` para clientes que já tinham qualquer etapa acima de DS-160 marcada.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v48_admin_10_etapas_grupo.sql`
