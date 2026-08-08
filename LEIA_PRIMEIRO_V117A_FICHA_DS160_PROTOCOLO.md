# V117A — Ficha DS-160 corrigida + protocolo do passaporte

## SQL obrigatório

Execute:

`supabase/migrations/20260713_v117a_passport_protocol.sql`

## Correção visual da Ficha Rápida DS-160

O problema ocorria porque a classe `admin-email-options` possui `position: absolute` e estava sendo reutilizada dentro do modal da ficha.

Agora:

- existe apenas uma janela/modal;
- os blocos “Dados comuns” e “Dados individuais” ficam dentro da mesma janela;
- os campos voltam a aceitar digitação normalmente;
- a janela possui rolagem vertical;
- a tabela individual possui rolagem horizontal quando necessário;
- o botão fechar encerra toda a ficha.

## Protocolo do passaporte

Adicionado em:

- Processo, datas e rastreios;
- resumo do cliente de passaporte;
- sincronização do grupo familiar.

## Mantém tudo da V117
