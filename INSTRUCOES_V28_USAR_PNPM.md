# V28 — Correção do npm usando pnpm

## Por que esta versão existe

A Vercel continuou falhando em:

npm error Exit handler never called!

Isso é erro do próprio npm durante instalação. Para contornar, esta versão deixa o projeto preparado para usar pnpm em vez de npm.

## O que foi alterado

- Removido package-lock.json
- Adicionado packageManager: pnpm@9.15.9
- Adicionado pnpm-lock.yaml
- Mantido Node 20.x
- Mantidas todas as alterações da v25/v27
- vercel.json limpo

## Se a Vercel ainda tentar usar npm

No painel da Vercel, vá em:

Project > Settings > Build & Development Settings

Em Install Command, coloque:

pnpm install --no-frozen-lockfile

Em Build Command, deixe:

npm run build

ou:

pnpm run build

Depois clique em Save e faça Redeploy.

## Supabase

Não precisa rodar SQL novo.
