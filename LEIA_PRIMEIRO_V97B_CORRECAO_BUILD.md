# V97B — Correção de build

Esta versão corrige erro de sintaxe no arquivo:

app/api/admin/email-compose/send/route.js

Mantém a V97 consolidada:
- Passaporte sem link de formulário;
- CPF permitido em mais de um processo;
- Página /passaporte-instrucoes;
- Email de instruções sem anexo;
- Feedback por serviço.

## SQL

Execute apenas:

supabase/migrations/20260510_v97_consolidada_passaporte_sem_anexo.sql

Se já executou esse SQL, não precisa executar novamente.
