# V69 — Correção de build da V68

## Correção

Corrige o erro do Vercel:

`ReferenceError: helpTexts is not defined`

## O que foi ajustado

No arquivo:

`lib/formSchema.js`

Foi garantido que:

- `defaultHelpTexts` fique exportado para o painel de balões;
- `helpTexts` continue existindo internamente para o formulário;
- o build do Next.js consiga compilar normalmente.

## SQL

Se você ainda não executou o SQL da V68, execute:

`supabase/migrations/20260510_v68_baloes_alertas.sql`

Se já executou, não precisa executar novamente.
