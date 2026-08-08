# V97 — Passaporte consolidado sem anexo

## Esta versão substitui V95 e V96

Como a V95/V96 ainda não foram baixadas/aplicadas, esta V97 consolida tudo em uma única atualização.

## Inclui

1. Passaporte não gera link de formulário.
2. Passaporte vira cadastro de controle automaticamente.
3. Permite mesmo CPF/data de nascimento em mais de um processo.
4. Fluxo próprio de passaporte.
5. Campos próprios:
   - cidade da Polícia Federal;
   - local/unidade da Polícia Federal;
   - data e hora do atendimento;
   - data de pagamento da GRU.
6. Emails de passaporte.
7. Página interna:
   /passaporte-instrucoes
8. Email P04 passa a ter botão para a página de instruções.
9. Nenhum anexo DOCX é enviado.
10. Feedback por serviço:
   - visto;
   - passaporte;
   - canadense.

## SQL obrigatório

Execute apenas este SQL no Supabase:

supabase/migrations/20260510_v97_consolidada_passaporte_sem_anexo.sql

Não precisa executar os SQLs da V95 nem da V96.
