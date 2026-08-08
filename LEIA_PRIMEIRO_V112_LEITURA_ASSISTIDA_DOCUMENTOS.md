# V112 — Leitura assistida de documentos

## Inclui

1. Mantém a V111:
   - cliente único;
   - módulo Clientes;
   - upload opcional de documentos no formulário.

2. Leitura assistida no upload do formulário:
   - passaporte;
   - visto anterior.

3. Quando possível, o sistema tenta extrair:
   - número do passaporte;
   - país emissor;
   - cidade/estado de emissão;
   - data de emissão;
   - data de vencimento;
   - número do visto;
   - data do último visto;
   - posto emissor.

4. Após o upload, o cliente vê:
   - dados encontrados;
   - botão Aplicar ao formulário;
   - opção Não aplicar agora.

5. A aplicação nunca é cega:
   - o cliente deve confirmar;
   - depois deve revisar os campos.

## Importante

Para extração automática por imagem, configure na Vercel:

OPENAI_API_KEY

Opcional:
OPENAI_DOCUMENT_MODEL=gpt-4o-mini

Sem essa variável, o upload continua funcionando, mas a extração automática fica desativada.

## PDF

Nesta versão, a extração automática é focada em imagens/fotos.
PDF continua sendo armazenado e vinculado ao cliente, mas pode não extrair dados automaticamente.

## SQL

Não há SQL novo se você já executou a V110 e V111.
