# V61 — Correção definitiva dos links de email

## Corrigido

- O botão `Gerar modelos de email (copiar)` não usa mais o `access_token` do formulário para abrir o modelo.
- Agora usa uma rota própria:
  `/email-preview/[id]?template=...`

## Por que isso corrige

Alguns clientes são `Cadastro de controle` e não possuem `access_token`.
Antes, ao abrir `/email/null?...`, o sistema mostrava `Link inválido`.

Agora o modelo de email é aberto pelo ID interno do cliente no Admin.

## Também corrigido

- A rota antiga `/email/[token]` passa a aceitar tanto `access_token` quanto `id`, para evitar regressões.
- Emails automáticos não geram links de formulário/preparação quando o cliente não possui `access_token`.

## SQL

Não precisa executar SQL novo.
