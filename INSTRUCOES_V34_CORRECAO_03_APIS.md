# V34 Consolidada — Correção 03 APIs autorizadas

## Problema corrigido

O login Supabase estava funcionando, mas as APIs administrativas ainda exigiam o cookie antigo `rv_admin_session`.
Por isso o painel abria, mas `/api/admin/clients` e `/api/admin/process-groups` retornavam 401.

## Solução

Criada ponte segura:

`POST /api/admin/supabase-session`

Ela:
- recebe o token da sessão Supabase;
- valida no servidor;
- confere o e-mail autorizado;
- cria o cookie administrativo usado pelas APIs existentes.

Assim:
- login continua sendo Supabase Auth;
- APIs antigas continuam funcionando;
- não é necessário reescrever todas as rotas agora.

## Teste

1. Abrir aba anônima.
2. Acessar `/admin/login`.
3. Entrar com e-mail e senha Supabase.
4. O painel deve carregar os clientes.
5. Se ainda houver erro, abrir `/admin/debug-auth` e verificar:
   - userEmail: seu e-mail
   - allowed: true
   - apiCookieAuthenticated: true

## Supabase

Não precisa rodar SQL novo.
