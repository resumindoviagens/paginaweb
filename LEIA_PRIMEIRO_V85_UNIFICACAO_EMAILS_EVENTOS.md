# V85 — Unificação operacional dos emails e eventos

## Inclui

- Correção visual: pergunta 2.19 em linha inteira.
- Remoção dos botões antigos:
  - Gerar modelos de email;
  - Enviar emails automáticos;
  - Instruções Foto.
- Mantido o botão único `Email` no card do cliente.
- Novo botão superior `Biblioteca de emails`.
- Novo modelo: `Instruções de foto`.
- Central de Eventos com botão `Email`:
  - abre editor;
  - permite alterar assunto e mensagem;
  - gera pré-visualização;
  - envia pelo sistema, com confirmação humana.
- Emails comerciais de passaporte/visto/aniversário com:
  - WhatsApp clicável;
  - Instagram clicável;
  - email clicável.
- Tela de login e admin com versão sincronizada.
- Marco de limpeza de alertas antigos.

## SQL

Execute no Supabase:

`supabase/migrations/20260510_v85_unificacao_emails_eventos.sql`
