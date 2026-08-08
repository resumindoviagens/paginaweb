# V68 — Balões editáveis e alertas baixáveis

## Inclui

1. Admin
   - botão `Desbloquear` fica inativo para cadastro de controle.
   - novo botão `Balões explicativos`.

2. Formulário
   - nova pergunta na página 3:
     `Onde foi emitido seu visto americano?`
   - opções:
     Brasília, São Paulo, Rio de Janeiro, Recife, Porto Alegre, Belo Horizonte.
   - as perguntas seguintes da página 3 avançam automaticamente a numeração.

3. Painel de balões
   - nova página `/admin/baloes`;
   - edita todos os balões explicativos;
   - botão `Salvar`;
   - botão `Salvar e Fechar Painel de Edição`.

4. Alertas
   - novo alerta:
     `Deixou informação de salário em branco`;
   - aparece se o cliente começou a preencher a página 7 e deixou salário vazio.
   - painel de alertas agora permite `Dar baixa`.

5. Persistência
   - balões e alertas baixados ficam salvos no Supabase.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v68_baloes_alertas.sql`
