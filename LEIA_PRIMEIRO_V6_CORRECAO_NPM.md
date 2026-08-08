# V6 - Correção do erro npm na Vercel

Esta versão remove o `package-lock.json` que estava causando falha no `npm install` na Vercel e fixa as versões das dependências.

## O que mudou

- Removido `package-lock.json`.
- Removido uso de `latest` nas dependências.
- Fixadas versões:
  - next: 16.2.4
  - react: 19.2.5
  - react-dom: 19.2.5
  - @supabase/supabase-js: 2.105.1
- Adicionado `.npmrc` com `legacy-peer-deps=true`.

## Como subir na Vercel

1. Cancele o deploy travado/erro atual.
2. Faça upload deste ZIP.
3. Aguarde novo build.
4. Se a Vercel perguntar, use framework Next.js.

## Variáveis obrigatórias na Vercel

- BREVO_API_KEY
- EMAIL_FROM
