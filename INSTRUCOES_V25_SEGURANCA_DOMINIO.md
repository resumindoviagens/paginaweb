# V25 — Segurança admin, domínio próprio e página blindada

## Alterações incluídas

- Botão alterado de "Enviar emails automáticos (Brevo)" para "Enviar emails automáticos".
- Marca d'água da página blindada reforçada e mais visível.
- Login administrativo mantido/reforçado com senha.
- Botão "Sair" no admin.
- Versão visível no topo do admin: v25 — login admin, domínio próprio e página blindada ativos.
- Preparado para uso com domínio próprio sem remover o domínio vercel.app.

## Variáveis obrigatórias na Vercel

Configure em Project > Settings > Environment Variables:

ADMIN_PASSWORD=sua_senha_forte
ADMIN_SESSION_SECRET=uma_frase_longa_aleatoria
NEXT_PUBLIC_SITE_URL=https://app.resumindoviagens.com.br

Se ainda não tiver configurado o domínio próprio, pode manter temporariamente:
NEXT_PUBLIC_SITE_URL=https://seu-projeto.vercel.app

## Domínio próprio

Na Vercel:
Project > Settings > Domains > Add Domain

Adicionar:
app.resumindoviagens.com.br

No registro.br, criar o CNAME indicado pela Vercel, geralmente:

Tipo: CNAME
Nome: app
Valor: cname.vercel-dns.com

O domínio antigo da Vercel continua funcionando. Não apague o domínio vercel.app.

## Supabase

Não precisa rodar SQL novo para esta versão.
