# V34 Consolidada — base segura

## Base
Esta versão foi gerada sobre o ZIP funcional enviado pelo usuário.

## Incluído
- Mantém domínio próprio funcionando.
- Mantém login administrativo via Supabase Auth.
- Página inicial `/` como login premium.
- `/admin/login` com o mesmo visual.
- Logo original do projeto preservado via `/public/logo.png`.
- Imagem premium de login baseada no conceito aprovado.
- Cabeçalhos de email:
  - `public/email-headers/header-nova-york.png`
  - `public/email-headers/header-orlando.png`
- Templates de email atualizados para usar cabeçalhos temáticos.
- Emails 01 a 05: tema Nova York.
- Emails 06 a 10: tema Orlando.
- Rótulo no admin atualizado para `v34 consolidada`.

## Importante
- Não precisa rodar SQL novo no Supabase.
- Não mexe ainda na estrutura mobile-first do formulário.
- A etapa mobile-first será a V35.

## Variáveis importantes
- NEXT_PUBLIC_SITE_URL deve apontar para o domínio ativo, preferencialmente:
  https://app.resumindoviagens.com.br
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_ADMIN_EMAILS
