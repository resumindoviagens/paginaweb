# V102 — Emails do Controle de Viagens + Localizador

## Inclui

1. Novo campo localizador da reserva:
   - localizador da ida;
   - localizador da volta/outro trecho.

2. Emails manuais do módulo de viagens:
   - V01 Agenda/calendário da viagem;
   - V02 Confirmação da compra/reserva;
   - V03 Oferta de seguro/hotel/carro/ingressos;
   - V04 Check-in 48h antes da ida;
   - V05 Check-in 48h antes da volta/outro trecho;
   - V06 Dia do voo de ida;
   - V07 Dia do voo de volta/outro trecho;
   - V08 Uma semana antes: falta algo?

3. Email de check-in inclui o localizador, pois é necessário para o cliente fazer check-in.

4. Email V01 pode enviar anexos .ICS:
   - voo de ida;
   - voo de volta/outro trecho;
   - check-in do hotel;
   - retirada do carro.

## Importante

Nesta versão os emails são manuais, por botão, dentro da viagem cadastrada.
Automação automática de viagens fica para a próxima etapa.

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260511_v102_emails_viagens_localizador.sql
