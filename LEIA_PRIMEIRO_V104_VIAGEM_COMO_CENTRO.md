# V104 — Viagem como centro do cadastro

## Mudança principal

O centro do módulo passa a ser a VIAGEM, e não mais o cliente.

## Inclui

1. Criar viagem diretamente.
2. Quantidade de passageiros de 1 a 9.
3. Campos de passageiros aparecem dinamicamente conforme a quantidade.
4. Passageiro pode ser:
   - selecionado entre clientes já cadastrados;
   - preenchido manualmente;
   - pré-cadastrado na lateral.
5. Organizador separado:
   - pode ser passageiro;
   - pode ser externo.
6. Destinatários dos emails:
   - apenas organizador;
   - todos os passageiros;
   - passageiros + organizador.
7. Edição completa da viagem.
8. Exclusão de viagem.
9. Emails continuam manuais e abrem em editor:
   - assunto editável;
   - HTML editável;
   - pré-visualização;
   - envio manual.
10. ICS no email V01 respeita os dados da viagem.
11. Emails exibem os passageiros da viagem.

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260511_v104_viagem_como_centro.sql

## Observação

Esta versão substitui a lógica cliente -> viagem.
A lógica passa a ser viagem -> passageiros.
