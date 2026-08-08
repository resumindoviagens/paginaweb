# v119 — Protocolo de Passaporte + WhatsApp direto

## Ajustes desta revisão

- Mantido o campo individual `passport_protocol` nos processos de Passaporte.
- Adicionado botão **Conversar no WhatsApp** nas ações de cada cliente.
- O botão abre `https://wa.me/<telefone>` sem mensagem pré-preenchida.
- Telefones brasileiros com ou sem máscara recebem o código 55 quando necessário.
- O botão fica desabilitado quando o cliente não possui telefone cadastrado.
- O antigo botão **WhatsApp** foi renomeado para **Mensagens prontas**, preservando formulário, lembrete, videochamada e pesquisa.
- A identificação da versão foi atualizada no painel administrativo, na rota `/admin/login` e na página inicial de login `/`.

## Banco de dados

Permanece necessário executar a migration da v119, caso ainda não tenha sido aplicada:

```sql
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS passport_protocol text;
```
