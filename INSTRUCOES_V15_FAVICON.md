# V15 — ícone da aba do navegador (favicon)

Esta versão adiciona o ícone da Resumindo Viagens na aba do navegador.

## O que mudou

- Adicionado `public/favicon.ico`.
- Adicionados PNGs auxiliares do favicon.
- Atualizado `app/layout.js` para declarar os ícones no metadata do Next.js.

## Supabase

Não precisa rodar nenhum SQL novo.
Não precisa apagar nada do Supabase.
As alterações SQL da V14 continuam válidas.

## Observação

Após o deploy, o navegador pode demorar a atualizar o favicon por cache. Se não aparecer de imediato:

1. Faça Ctrl + F5.
2. Abra em janela anônima.
3. Aguarde alguns minutos.
