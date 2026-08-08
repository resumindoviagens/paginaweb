# V112A — Diagnóstico da leitura assistida/OCR

## Objetivo

Esta versão não muda o fluxo do usuário. Ela melhora o diagnóstico quando a leitura automática de passaporte/visto falha.

## Inclui

1. Novas colunas em `client_documents`:
   - extraction_error;
   - extraction_raw;
   - extraction_model;
   - extraction_attempted_at.

2. A API passa a gravar o erro real retornado pela OpenAI.

3. Após novo teste, consulte no Supabase:

```sql
select
  extraction_status,
  extraction_error,
  extraction_model,
  extraction_raw,
  mime_type,
  file_name,
  created_at
from client_documents
order by created_at desc
limit 5;
```

## SQL obrigatório

Execute:

supabase/migrations/20260511_v112a_diagnostico_ocr.sql
