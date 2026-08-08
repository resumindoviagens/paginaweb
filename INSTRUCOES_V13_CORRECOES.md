# V13 — correções aplicadas

## O que mudou

1. Cadastro inicial simplificado
- Removidos do cadastro inicial: Data CASV, Data entrevista, Data videochamada e Cidade do consulado.
- Esses dados continuam no botão **Datas e alertas** de cada cliente.

2. Edição de dados do cliente
- Novo botão **Editar dados** em cada cliente.
- Permite alterar: nome, CPF, data de nascimento, celular, email e observações internas.

3. Envio automático de emails
- Botão de envio automático continua ativo.
- Emails 05 e 06 continuam como **não disponível** para envio automático, pois exigem anexos/manuseio manual.
- O sistema só marca o email como enviado quando a Brevo aceita o envio.
- A mensagem do sistema informa que a Brevo aceitou o envio; a entrega final deve ser conferida nos logs da Brevo se necessário.

4. Assuntos dos emails
- Removida a numeração dos assuntos enviados ao cliente.
- A numeração continua apenas nos botões internos, para organização do fluxo.

## SQL necessário no Supabase

Se você já executou o SQL da V11, não precisa repetir. Se ainda não executou, cole APENAS o SQL abaixo no SQL Editor do Supabase:

```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS interview_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS casv_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS video_call_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS consulate_city TEXT;
```

Observação: o checklist de emails enviados usa a tabela `audit_logs`, que já existe no projeto.
