# V34 Consolidada — Correção 02

## Objetivo

Corrigir login que ficava preso em "autenticando" / "verificando acesso".

## Alterações

- Simplificada autenticação do `/admin`.
- Removida dependência de API antiga de senha/status.
- Login aguarda sessão Supabase ser gravada antes de redirecionar.
- Redirecionamento alterado para `window.location.assign/replace`.
- Adicionada página temporária de diagnóstico:
  `/admin/debug-auth`

## Como testar

1. Abrir aba anônima.
2. Acessar `/admin/login`.
3. Entrar com e-mail e senha Supabase.
4. Deve abrir `/admin`.
5. Se travar, acessar `/admin/debug-auth` e verificar:
   - hasUrl: true
   - hasAnonKey: true
   - userEmail: seu e-mail
   - allowed: true

## Supabase

Não precisa rodar SQL novo.
