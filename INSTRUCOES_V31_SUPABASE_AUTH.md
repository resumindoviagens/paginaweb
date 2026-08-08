# V31 — Login administrativo com Supabase Auth

## Novidades

- Login admin com email + senha
- Recuperação "Esqueci minha senha"
- Redefinição de senha
- Sessão segura do Supabase
- Emails autorizados

## Como criar usuário admin

Supabase → Authentication → Users → Add user

Email:
contato@resumindoviagens.com.br

Defina uma senha inicial.
Marque:
Auto Confirm User

## Variáveis Vercel

Mantenha as variáveis Supabase já existentes.

Adicionar:

NEXT_PUBLIC_ADMIN_EMAILS=contato@resumindoviagens.com.br

## Supabase URL Configuration

Authentication → URL Configuration

Site URL:
https://app.resumindoviagens.com.br

Redirect URLs:
https://app.resumindoviagens.com.br/admin/redefinir-senha
https://SEU-PROJETO.vercel.app/admin/redefinir-senha

## Acesso

/admin/login

## Observação

A senha antiga da Vercel pode permanecer temporariamente como fallback.
