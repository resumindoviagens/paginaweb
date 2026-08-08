# V121B — pacote preparado para publicação na raiz

Este ZIP foi montado sem a pasta externa `visto-seguro-main`. Ao extrair, os diretórios `app`, `lib`, `components`, `public` e o arquivo `package.json` aparecem imediatamente.

## Por que esta versão foi gerada

A tela de produção continuou mostrando V120B. Isso demonstra que o código V121A não foi o código efetivamente servido pela Vercel. As causas mais prováveis são: conteúdo enviado para uma subpasta do repositório, branch diferente da branch de produção ou build/deploy não concluído.

## Conferência obrigatória no GitHub

Antes de aguardar a Vercel, abra no repositório:

- `app/admin/page.js` e procure `v121B`;
- `lib/formSchema.js` e procure `2.18.a`;
- `app/acesso/[token]/page.js` e procure `Upload de documentos (implementação)`.

## Conferência na Vercel

O novo deployment precisa aparecer como `Ready` e estar associado ao commit que contém esses marcadores. Se aparecer `Error`, a versão antiga continuará no ar.

## SQL

Esta correção de empacotamento não adiciona SQL. Permanece necessário executar o SQL da V121, caso ainda não tenha sido executado:

`supabase/migrations/20260726_v121_automacoes_horarios_formulario.sql`
