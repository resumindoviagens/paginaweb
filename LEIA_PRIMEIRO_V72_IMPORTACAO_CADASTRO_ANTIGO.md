# V72 — Importação cautelosa de cadastro antigo

## O que esta versão cria

1. Novo botão no Admin:
   - `Cadastro antigo`

2. Os clientes importados da planilha ficam temporariamente nessa aba.

3. Cada cliente antigo terá o botão:
   - `Remeter para concluídos`

4. Ao clicar nesse botão:
   - o cliente sai de `Cadastro antigo`;
   - entra em `Processos concluídos`.

## Regra de CPF duplicado

O SQL da importação verifica antes de inserir:

- se já existir cliente com o mesmo CPF no banco, ele NÃO será importado;
- esse cliente permanece onde já está:
  - Processos em andamento; ou
  - Processos concluídos.

## Quantidade preparada para importação

A planilha gerou 442 registros válidos para importação.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v72_importacao_cadastro_antigo.sql`

## Ordem recomendada

1. Subir este projeto no GitHub.
2. Aguardar deploy da Vercel.
3. Executar o SQL da V72 no Supabase.
4. Abrir o Admin.
5. Conferir a nova aba `Cadastro antigo`.
6. Revisar cliente por cliente.
7. Clicar em `Remeter para concluídos` somente quando estiver tudo certo.
