# V29 — Correção pnpm sem lockfile incompleto

## O que aconteceu

A Vercel já passou a usar pnpm corretamente, mas falhou porque o pnpm-lock.yaml estava incompleto:

@supabase/supabase-js@2.105.1 not found in pnpm-lock.yaml

## O que foi corrigido

- Removido pnpm-lock.yaml incompleto
- Removido package-lock.json
- Mantido packageManager: pnpm@9.15.9
- Mantido Node 20.x
- Mantidas dependências travadas
- .npmrc ajustado para não exigir lock congelado

## Se a Vercel ainda falhar

Vercel > Project > Settings > Build & Development Settings

Install Command:
pnpm install --no-frozen-lockfile

Build Command:
pnpm run build

Depois faça Redeploy.

## Supabase

Não precisa rodar SQL novo.
