# V110 — Upload opcional de documentos no formulário do cliente

## Inclui

1. Nova etapa antes das perguntas:
   - página 1: Informações prévias/vídeo;
   - página 2: Upload opcional de documentos;
   - depois começam as perguntas do formulário.

2. A numeração das perguntas NÃO muda:
   - a primeira página de perguntas continua como página 1.

3. Upload opcional:
   - passaporte;
   - visto anterior.

4. Aceita:
   - foto tirada no celular;
   - imagem da galeria;
   - PDF.

5. Os arquivos são salvos no Supabase Storage:
   - bucket privado `resumindo-docs`.

6. Os documentos ficam registrados na tabela:
   - `client_documents`.

## Importante

Nesta versão, a leitura automática/OCR ainda não preenche campos.
Ela cria a estrutura segura de upload e armazenamento para a próxima etapa.

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260511_v110_upload_documentos_formulario.sql
