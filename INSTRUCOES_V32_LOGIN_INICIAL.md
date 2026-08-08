# V32 — Página inicial como login administrativo

## Alterações

- A página inicial `/` agora já é a página de login administrativo.
- Removida a tela intermediária com botão "Acesso interno".
- Página inicial informa que o endereço é de uso exclusivo da Resumindo Viagens.
- Logotipo mantido na autenticação.
- Layout visual mais profissional e temático.
- `/admin/login` também usa a nova tela de login.
- Painel interno não exibe mais a tela antiga de senha simples.

## Importante

A autenticação continua sendo feita pelo Supabase Auth.
A senha não fica salva na Vercel.

## Variável obrigatória

NEXT_PUBLIC_ADMIN_EMAILS=contato@resumindoviagens.com.br

## Supabase

Não precisa rodar SQL novo.
