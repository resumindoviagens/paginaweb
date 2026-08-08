# V123 — novos campos de formação

Base técnica: V122 (correção definitiva do fuso de Brasília).

## Campos incluídos

### 7.11
- 7.11.h — Nome do Curso?
- 7.11.i — Data início do Curso (pode ser apenas mês e ano)
- 7.11.j — Data término do Curso (pode ser apenas mês e ano)

### 7.13
- 7.13.h — Nome do Curso? (informe o tipo de curso: graduação, pós-graduação, mestrado)
- 7.13.i — Data início do Curso (pode ser apenas mês e ano)
- 7.13.j — Data término do Curso (pode ser apenas mês e ano)

## Comportamento
- Datas usam campo mês/ano, sem exigir o dia.
- Os novos campos seguem as mesmas regras condicionais de 7.11 e 7.13.
- Se 7.10 for "Não", os campos 7.11 e 7.13 continuam desabilitados.
- Se 7.12 for "Não", os campos 7.13 continuam desabilitados.
- Os novos campos aparecem automaticamente no painel de balões explicativos.
- Corrigida a numeração exibida no painel de balões para respeitar subitens como 7.11.a, 7.11.h etc.
- O PDF das respostas exibe mês/ano no formato abreviado (ex.: AGO/2026).

## Banco de dados
Não há SQL novo: as respostas do formulário são armazenadas na estrutura já existente de respostas.
