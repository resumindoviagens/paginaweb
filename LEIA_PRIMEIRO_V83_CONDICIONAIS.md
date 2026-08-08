# V83 — Condicionais do formulário

## Inclui

1. Página 2
   - se `2.19 — Alguém viajará com você?` for `Não`,
   - bloqueia 2.20 em diante da página 2;
   - os campos ficam cinza;
   - respostas antigas são limpas;
   - campos bloqueados contam como resolvidos no progresso.

2. Antiga 2.20 desmembrada
   - A.1 Nome completo / A.2 Relacionamento;
   - B.1 Nome completo / B.2 Relacionamento;
   - C.1 Nome completo / C.2 Relacionamento;
   - D.1 Nome completo / D.2 Relacionamento;
   - E.1 Nome completo / E.2 Relacionamento.

3. Página 6 — Estado Civil
   - Solteiro: bloqueia cônjuge, ex-cônjuge e cônjuge falecido.
   - Casado / União estável / União doméstica: bloqueia ex-cônjuge e cônjuge falecido.
   - Divorciado: bloqueia cônjuge e cônjuge falecido.
   - Viúvo: bloqueia cônjuge e ex-cônjuge.

4. Página 6 — Subtítulos
   - CÔNJUGE;
   - EX-CÔNJUGE;
   - CÔNJUGE FALECIDO.

5. Campos bloqueados
   - todos usam o padrão cinza criado na V82;
   - avisam que o campo foi desabilitado automaticamente.

6. Alertas antigos
   - cria marco de baixa dos alertas anteriores para recomeçar a análise dos alertas.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v83_condicionais_alertas.sql`
