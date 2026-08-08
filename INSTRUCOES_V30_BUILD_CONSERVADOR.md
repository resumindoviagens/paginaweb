# V30 — Build conservador para destravar Vercel

## O que foi alterado

Esta versão remove a tentativa com pnpm e volta para uma configuração conservadora:

- Removido pnpm-lock.yaml
- Removido package-lock.json
- Removido packageManager
- Removido engines/node forçado
- Next travado em 14.2.23
- React travado em 18.2.0
- Supabase travado em 2.45.4
- vercel.json limpo, sem installCommand e sem buildCommand

## O que fazer na Vercel

Vá em:

Project > Settings > Build & Development Settings

E LIMPE os campos:

- Install Command: deixar vazio / Default
- Build Command: deixar vazio / Default

Se não permitir vazio:
- Install Command: npm install --legacy-peer-deps --no-audit --no-fund
- Build Command: npm run build

Depois faça Redeploy sem cache.

## Por que isso

O npm falhava com versões latest e o pnpm falhou no fetch do registry.
Esta versão usa versões estáveis e antigas o bastante para o ambiente da Vercel instalar sem conflito.

## Supabase

Não precisa rodar SQL novo.
