# Correção preventiva — campos de cadastro do cliente

Esse pacote corrige o erro:

`Could not find the 'observacoes_gerais' column of 'clients' in the schema cache`

E já inclui outros campos de cadastro/processo que podem aparecer como erro parecido.

## Como aplicar

1. Abra o Supabase.
2. Vá em SQL Editor.
3. Clique em New Query.
4. Cole o conteúdo do arquivo:

`supabase/migrations/20260509_fix_campos_cadastro_clients.sql`

5. Clique em Run.
6. Depois faça redeploy na Vercel.

## Campos adicionados

- data_inicio_processo
- data_final_processo
- observacoes_gerais
- tipo_processo
- grupo_processo
- rastreio_passaporte
- data_casv
- data_entrevista
- data_videochamada
