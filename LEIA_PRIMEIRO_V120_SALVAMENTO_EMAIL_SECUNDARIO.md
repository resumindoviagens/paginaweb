# V120 — Base V119 + salvamento resiliente + e-mail secundário

## Base confirmada

O ZIP recebido possui no painel:

`v119 — protocolo de Passaporte + WhatsApp direto`

A V120 foi construída diretamente sobre essa base, preservando as alterações da V119.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260724_v120_secondary_email.sql`

O SQL adiciona:

- `clients.secondary_email`
- `people.secondary_email`

## Correção do salvamento de Passaporte

Para o líder do grupo familiar:

- salva primeiro cidade, local, data/hora, GRU, protocolo e rastreio no líder;
- tenta sincronizar os demais membros depois;
- repete automaticamente a requisição em falhas temporárias;
- não exibe mais HTML técnico do Cloudflare/Supabase;
- em erro 525, mostra mensagem clara;
- mantém os valores digitados para nova tentativa.

## E-mail secundário

Adicionado em:

- cadastro de cliente;
- edição de cliente;
- resumo do card;
- editor de e-mail.

Regra de envio:

- E-mail principal: destinatário principal (To)
- E-mail secundário: cópia (CC)

O CC foi aplicado aos principais fluxos de cliente:

- botões/modelos de e-mail;
- editor de e-mail;
- agendas e lembretes;
- pesquisas de satisfação e reenvios.

Se o campo estiver vazio, o comportamento permanece igual ao anterior.

## Sem alteração no formulário público

O cliente não visualiza o e-mail secundário no formulário.
