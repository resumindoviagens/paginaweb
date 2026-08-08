# Resumindo Viagens — pacote final completo

Este ZIP contém o projeto completo para subir no GitHub.

Inclui:
- campo E-mail no cadastro do admin;
- e-mail salvo e exibido na lista;
- botão Criar email abrindo modelo premium em nova aba;
- log em pop-up por cliente;
- botão Gerar PDF por cliente;
- exclusão com confirmação de senha;
- Instagram clicável;
- explicação de que não é formulário do consulado;
- nome do cliente em destaque;
- link seguro com confirmação por CPF e data;
- data digitada no formato DD/MM/AAAA;
- salvamento automático;
- PDF final;
- balões explicativos.

## 1. Supabase

Se ainda não rodou, execute no SQL Editor:

```sql
alter table clients add column if not exists email text;
```

Também incluí o arquivo:
`supabase-migration-add-client-email.sql`

## 2. Vercel

Confirme as variáveis:

SUPABASE_URL  
SUPABASE_SERVICE_ROLE_KEY  
ADMIN_PASSWORD  
ADMIN_SESSION_SECRET  
NEXT_PUBLIC_SITE_URL

Exemplo para NEXT_PUBLIC_SITE_URL:
https://visto-seguro.vercel.app

## 3. Atualização

1. Descompacte o ZIP.
2. Suba todo o conteúdo no GitHub.
3. Commit changes.
4. Vercel > Redeploy sem cache.
