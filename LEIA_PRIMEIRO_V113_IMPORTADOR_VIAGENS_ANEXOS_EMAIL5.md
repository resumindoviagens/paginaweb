# V113 — Importador de Viagens + Anexos temporários no Email 05

## Parte 1 — Gestão de viagens

Inclui botão na tela de criação/edição de viagem:

- Importar dados extraídos pelo ChatGPT

Aceita:
- CSV;
- TXT com formato CSV;
- JSON.

O arquivo pode preencher, para conferência:
- nome da viagem;
- destino;
- organizador;
- passageiros;
- nome como consta na reserva;
- voo;
- localizador;
- datas;
- hotel;
- seguro;
- observações.

Nada é salvo automaticamente sem revisão: o arquivo apenas preenche o formulário da viagem.

## Parte 2 — Email 05 / Agendamento confirmado

No editor de email do admin foi incluído campo de anexos temporários.

Uso previsto:
- CONFIRMATION;
- APPLICATION;
- AGENDAMENTO.

Os anexos são enviados junto com o email, mas não ficam armazenados permanentemente no sistema.

## SQL

Não há SQL novo nesta versão.
