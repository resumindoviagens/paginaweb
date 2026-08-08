# V63 — Correção de build da V62

Corrige o erro do Vercel:

`Nullish coalescing operator(??) requires parens when mixing with logical operators`

## O que foi corrigido

As expressões que misturavam `??` com `||` foram ajustadas com parênteses.

## SQL

Não precisa executar SQL novo se o SQL da V62 já foi executado.
