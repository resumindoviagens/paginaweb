# V114A — Correção de anexos temporários no editor de email

## Problema corrigido

Na V114, o painel dizia que os arquivos estavam anexados, mas eles podiam não chegar no email porque o backend só incluía os anexos para alguns IDs de modelo.

O email 05 real do sistema usa o ID:

`instrucoes`

e não estava na lista inicial de IDs liberados.

## Correção

1. O modelo `instrucoes` foi incluído.
2. Além disso, se houver anexos temporários no editor, eles passam a ser enviados independentemente do modelo escolhido.
3. O log passa a registrar:
   - quantidade de anexos;
   - nomes dos anexos temporários.

## SQL

Não há SQL novo.
