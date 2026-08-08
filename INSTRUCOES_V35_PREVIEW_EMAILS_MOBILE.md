# V35 Preview — Emails temáticos + base mobile

## Correções dos emails

- Cabeçalhos dos emails agora são imagens reais salvas no projeto:
  - /public/email-headers/header-nova-york.png
  - /public/email-headers/header-orlando.png
- As imagens incluem o logotipo original do sistema.
- O HTML dos emails usa URL absoluta pública.
- Emails 01 a 05 usam tema Nova York.
- Emails 06 a 10 usam tema Orlando.
- Aplica tanto no botão de gerar modelo quanto no envio automático, pois ambos usam `lib/emailTemplates.js`.

## Importante na Vercel

Verifique se existe:
NEXT_PUBLIC_SITE_URL=https://app.resumindoviagens.com.br

## Base mobile incluída

- Campos maiores no celular.
- Navegação de seções horizontal.
- Cards mais confortáveis.
- Sem transformar em uma pergunta por página.

## Próxima etapa

Depois de validar emails e visual básico mobile, fazer V35 completa mobile-first.
