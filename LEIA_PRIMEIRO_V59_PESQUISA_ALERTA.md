# V59 — Pesquisa enviada/respondida com alerta

## O que muda

1. Quando o email/modelo/link da pesquisa é gerado/enviado:
   - marca automaticamente a etapa:
     `Pesquisa de satisfação enviada`.

2. Quando o cliente responde a pesquisa:
   - marca automaticamente a etapa:
     `Pesquisa de satisfação respondida`.

3. Quando o cliente responde:
   - envia alerta automático para:
     `contato@resumindoviagens.com.br`
   - usando a configuração de alertas internos/Brevo.

4. A etapa `Pesquisa de satisfação postada` continua existindo para controle manual posterior.

## SQL obrigatório

Execute:

`supabase/migrations/20260510_v59_pesquisa_enviada_respondida_alerta.sql`
