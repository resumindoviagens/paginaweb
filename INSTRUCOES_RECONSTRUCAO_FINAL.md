# Projeto final reconstruído

Inclui as correções consolidadas:
- campo E-mail no cadastro admin;
- e-mail salvo e exibido na lista de clientes;
- botão Criar email abre e-mail premium em nova aba;
- log abaixo da lista removido;
- botão Ver log abre pop-up do cliente específico;
- botão Gerar PDF por cliente;
- exclusão pede senha;
- Instagram clicável;
- explicação de que não é o formulário do consulado;
- nome do cliente em destaque no cabeçalho;
- e-mail premium com nome, botão, link em texto, explicações, logo e cores da marca.

## Banco de dados
Antes de testar cadastro com e-mail, rode no Supabase:

```sql
alter table clients add column if not exists email text;
```

Ou rode o arquivo:
`supabase-migration-add-client-email.sql`

## Vercel
Confirme se existe:
`NEXT_PUBLIC_SITE_URL=https://visto-seguro.vercel.app`

## Atualização
1. Descompacte o ZIP.
2. Suba todo o conteúdo no GitHub.
3. Commit changes.
4. Vercel > Redeploy sem cache.
