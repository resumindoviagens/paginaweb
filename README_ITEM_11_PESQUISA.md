# V39 — Item 11: Enviar pesquisa de satisfação

Este pacote corrige a lacuna operacional: o sistema precisa permitir gerar efetivamente a pesquisa.

## Onde colocar

### Modal Gerar modelos de email
Adicionar:

`11 - Enviar pesquisa de satisfação`

### Modal Enviar emails automáticos
Adicionar:

`11 - Enviar pesquisa de satisfação`

## Regra

Antes de marcar:

`10 - Passaporte recebido / encerramento`

o item 11 aparece, mas fica bloqueado.

Depois de marcar:

`10 - Passaporte recebido / encerramento`

o item 11 fica ativo.

## Ao clicar

Chamar:

`POST /api/feedback/liberar`

Com:

`clientId`

Retorno esperado:

`link: https://app.resumindoviagens.com.br/feedback/[token]`

## Onde o cliente responde

`/feedback/[token]`

## Onde o admin vê

`/admin/feedbacks`

## Alerta no card do cliente

Após resposta:

`Avaliação recebida: nota X/10`

## Botão Instagram

Fica em:

`/admin/feedbacks`

Nome:

`Gerar postagem Instagram`

Só ativo se o cliente autorizou divulgação.
