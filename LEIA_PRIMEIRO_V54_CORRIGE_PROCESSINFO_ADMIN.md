# V54 — Correção do erro processInfo no Admin

Corrige o erro:

`ReferenceError: processInfo is not defined`

O erro acontecia porque a função `groupColorFor`, usada para pintar os grupos por cor, estava tentando chamar `processInfo(client)` fora do escopo onde essa função existe.

## O que foi alterado

- `groupColorFor` agora usa apenas dados diretamente disponíveis no objeto `client`;
- mantém a lógica de cor por grupo/família;
- atualiza a versão visual do Admin para V54.

## SQL

Não exige SQL novo.
