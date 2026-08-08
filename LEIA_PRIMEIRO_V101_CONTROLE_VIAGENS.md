# V101 — Controle de Viagens

## Inclui

1. Remove da tela principal:
   - Cadastro Antigo;
   - Migrar cadastro antigo;
   - Conferir e limpar migrados;
   - Enviar avaliações antigas.

2. Novo botão:
   - Administração de Viagens.

3. Novo módulo:
   - /admin/viagens

4. Cadastro de cliente de viagem:
   - nome;
   - email;
   - telefone;
   - CPF;
   - data de nascimento;
   - email adicional para alertas/comprador.

5. Clientes já existentes do módulo de vistos/passaportes são importados para viagens via SQL.

6. Cadastro de viagem:
   - destino;
   - passageiros;
   - comprador/responsável;
   - passagem aérea ida;
   - volta/outro trecho;
   - hotel;
   - carro;
   - seguro;
   - ingressos;
   - serviços agregados;
   - timeline inicial da viagem.

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260511_v101_controle_viagens.sql

## Observação

Esta primeira versão do controle de viagens NÃO dispara emails automáticos ainda.
Ela cria a base operacional para a próxima etapa.
