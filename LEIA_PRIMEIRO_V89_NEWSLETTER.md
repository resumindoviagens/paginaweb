# V89 — Newsletter base segura

## Inclui

- Novo botão `Newsletter` no Admin.
- Painel com contagem:
  - total de clientes;
  - clientes com email;
  - clientes sem email;
  - descadastrados;
  - elegíveis;
  - concluídos/aprovados.
- Criação de campanha em rascunho.
- Pré-visualização premium.
- Envio de teste para contato@resumindoviagens.com.br ou outro email informado.
- Link de descadastro `/unsubscribe/[token]`.
- Campos no banco para opt-out.
- Estrutura de campanhas e destinatários.

## Importante

Esta versão NÃO envia newsletter em massa ainda.
Ela prepara a base segura antes do envio em lotes.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v89_newsletter_base.sql`
