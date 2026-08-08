# V109 — V108 + ajuste da pergunta 7.9

## Inclui tudo da V108

- Passageiro manual vira cliente automaticamente se tiver nome, CPF e data de nascimento.
- Evita duplicidade por CPF.
- Campo nome como consta na reserva.
- Status visual: cliente vinculado, cliente será criado ou passageiro temporário.

## Também inclui o ajuste da pergunta 7.9

Nova redação:

Informe dados do último emprego anterior ou atividade anterior (Nome completo da empresa, empregador. Endereço completo. Data de início e término desse vínculo. Nome da função e descrição das atividades realizadas.)

O campo `dadosEmpregoAnterior` recebeu área maior de texto (`rows: 8`).

## SQL obrigatório

Execute o SQL da V108, caso ainda não tenha executado:

supabase/migrations/20260511_v108_passageiro_vira_cliente.sql

Não há SQL extra para o ajuste da pergunta 7.9.
