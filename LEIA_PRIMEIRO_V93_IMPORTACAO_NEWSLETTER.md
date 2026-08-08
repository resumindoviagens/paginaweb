# V93 — Importação de contatos para Newsletter

## Inclui

- Importar contatos por CSV ou texto colado.
- Aceita arquivo `.csv` ou `.txt`.
- Campos aceitos:
  - nome
  - email
  - telefone
  - categoria
  - observacoes
- Categorias:
  - Cliente
  - Fornecedor
  - Parceiro
  - Governo
  - Outros
- Origem:
  - csv_import
  - gmail_import
  - manual
- Classificação automática por palavras-chave.
- Não duplica email já existente.
- Não sobrescreve contatos descadastrados, bloqueados ou bounced.
- Relatório de importação:
  - linhas totais;
  - novos;
  - atualizados;
  - ignorados;
  - protegidos;
  - inválidos.
- Filtro por categoria na tela de contatos.

## Sobre Gmail

Esta versão não usa OAuth nem conexão automática com Gmail.

A importação do Gmail deve ser feita gerando uma tabela/CSV externa e colando/importando no painel.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v93_importacao_contatos_newsletter.sql`
