# V52 — Grupos coloridos e cadastro de controle sem links

## Ajustes

1. Grupos/famílias:
   - cada grupo recebe uma cor forte/suave diferente;
   - todos os clientes do mesmo grupo usam a mesma cor no card/linha.

2. Cadastro de controle:
   - não exibe link de formulário;
   - desabilita Copiar link;
   - desabilita Abrir;
   - desabilita Novo link;
   - se marcar como controle, apaga o access_token;
   - se desmarcar controle, gera link automaticamente se estiver sem link.

3. Emails 01 a 03:
   - desabilitados em Gerar modelos de email;
   - desabilitados em Enviar emails automáticos;
   - apenas para cadastro de controle.

## SQL obrigatório

Execute:

`supabase/migrations/20260510_v52_controle_links_cores.sql`
