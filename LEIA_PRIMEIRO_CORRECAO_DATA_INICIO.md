# Correção — data_inicio_processo

Erro exibido:

Could not find the 'data_inicio_processo' column of 'clients' in the schema cache

## O que fazer

1. Abra o Supabase.
2. Vá em SQL Editor.
3. Crie uma New Query.
4. Cole o conteúdo do arquivo:

supabase/migrations/20260509_fix_data_inicio_processo.sql

5. Clique em Run.
6. Depois faça redeploy na Vercel.

## Observação

A coluna `data_inicio_processo` provavelmente era usada pelo formulário/admin, mas não existia no banco atual ou foi perdida em alguma migração anterior.
