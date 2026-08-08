# V105 — Correção de fuso de viagem + editor visual de email

## Correção crítica

Corrige o bug em que horários de voo digitados no módulo de viagens perdiam 3 horas por conversão UTC/São Paulo.

Exemplo corrigido:
- digitado: 25/06/2026 01:50
- exibido: 25/06/2026 01:50

## Onde foi corrigido

- tela de viagens;
- edição de viagens;
- preview dos emails;
- emails enviados;
- geração de ICS.

## Email editável

A janela de email agora mostra:
- Assunto editável;
- Texto editável;
- Pré-visualização aproximada;

Não mostra mais código HTML para edição operacional.

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260511_v105_correcao_fuso_viagens.sql

## Atenção

Viagens já salvas com horário errado devem ser abertas em Editar viagem, corrigidas uma vez e salvas novamente.
