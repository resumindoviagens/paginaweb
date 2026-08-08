# V120A — Avaliação específica de Passaporte

## Inclui tudo da V120

- correção do erro 525 e salvamento resiliente;
- e-mail secundário em CC;
- funcionalidades da V119.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260724_v120a_feedback_passaporte.sql`

Esse SQL atualiza a restrição da tabela `feedbacks` para aceitar:

- aprovado;
- negado;
- passaporte;
- canadense.

## Melhorias

- corrige o erro `feedbacks_tipo_feedback_check`;
- cria/expõe o botão **Email — avaliação passaporte**;
- mantém o modelo `P07 - Passaporte: pesquisa de satisfação`;
- cria mensagem de WhatsApp específica para emissão de passaporte;
- a pesquisa de passaporte pergunta especificamente sobre:
  - documentos;
  - cadastro;
  - taxa;
  - agendamento PF;
  - instruções;
  - acompanhamento até retirada;
  - suporte e agilidade.
- mantém envio para e-mail principal e CC para e-mail secundário.
