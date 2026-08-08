# V108 — Passageiro manual vira cliente

## Inclui

1. Ao salvar uma viagem, passageiro manual vira cliente automaticamente se tiver:
   - nome;
   - CPF;
   - data de nascimento.

2. Se já existir cliente com o mesmo CPF em `travel_customers`, o passageiro será vinculado a esse cliente em vez de criar duplicado.

3. Se faltar algum dado básico, o app avisa antes de salvar:
   - falta CPF;
   - falta data de nascimento;
   - falta nome.

4. O passageiro pode ficar temporário na viagem, sem virar cliente, se você confirmar o salvamento mesmo com dados incompletos.

5. Novo campo:
   - nome completo do cliente;
   - nome como consta na reserva.

6. Status visual no passageiro:
   - cliente vinculado;
   - será criado como cliente;
   - passageiro temporário.

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260511_v108_passageiro_vira_cliente.sql

## Observação para leitura futura de documentos

A estrutura já fica preparada para:
- nome da reserva diferente do nome completo;
- vínculo sugerido;
- passageiro temporário;
- confirmação antes de criar cliente.
