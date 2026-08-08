# V73 — Correção do SQL da importação de cadastro antigo

## Correção

O erro do Supabase era:

`column "data_inicio_processo" is of type date but expression is of type text`

A causa era que o bloco `WITH import_rows AS (VALUES...)` estava inferindo algumas datas como texto.

## O que foi corrigido

O `SELECT` final do SQL agora aplica casts explícitos:

- `birth_date::date`
- `data_inicio_processo::date`
- `casv_date::date`
- `interview_date::date`
- `visa_expiration_date::date`
- `passport_expiration_date::date`
- `video_call_date::timestamp with time zone`
- booleanos como `::boolean`

## Qual SQL executar agora

Execute este arquivo no Supabase:

`supabase/migrations/20260510_v73_importacao_cadastro_antigo_corrigido.sql`

## Importante

Como o SQL anterior deu erro, ele não importou os clientes.
Pode executar o V73 corrigido normalmente.

A regra de segurança continua mantida:
se já existir CPF no banco, o cliente não será importado novamente.
