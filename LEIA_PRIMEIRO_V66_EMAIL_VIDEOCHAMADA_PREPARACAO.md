# V66 — Correção do email de videochamada e link de preparação

## Corrigido

1. Email 06A — Videochamada agendada
   - agora puxa a data e hora cadastrada em `Processo, datas e rastreios`;
   - em grupos familiares, também busca a data no grupo de processo.

2. Email automático 06A
   - também passa a usar a data e hora correta.

3. Links de preparação dos emails 06 e 06A
   - agora geram link mesmo quando o cliente é cadastro de controle ou não possui access_token;
   - rota de preparação aceita `access_token` ou `id` do cliente.

## SQL

Não precisa executar SQL novo se a V65 já foi executada.
