# V122 — Correção definitiva do fuso de Brasília em agenda e ICS

## Problema corrigido

Um compromisso digitado como **08:00** podia aparecer no email e no calendário como **05:00**.
Isso ocorria porque o valor salvo pelo campo `datetime-local` era tratado como UTC e depois convertido novamente para Brasília.

## Regra aplicada

Todos os horários operacionais do módulo de vistos são interpretados como:

- `America/Sao_Paulo`
- horário de Brasília
- UTC-03:00

A regra vale para:

- CASV;
- entrevista no consulado/embaixada;
- compromisso único de Recife e Porto Alegre;
- renovação;
- videochamada;
- Polícia Federal/passaporte;
- agenda enviada ao cliente;
- agenda interna da Resumindo Viagens;
- lembretes automáticos.

## Formato do ICS

Os arquivos agora usam explicitamente:

```ics
DTSTART;TZID=America/Sao_Paulo:20260922T080000
DTEND;TZID=America/Sao_Paulo:20260922T090000
```

Não usam mais `08:00Z`, que fazia alguns calendários exibirem 05:00.

## Banco de dados

Não é necessário executar SQL. A correção respeita os horários que já estão cadastrados no sistema.

## Atenção

Arquivos `.ics` já recebidos não mudam dentro da caixa de entrada. Esta versão altera o identificador técnico das agendas e permite que cada compromisso futuro receba **uma única cópia corrigida** pelo próximo cron diário ou pelo botão administrativo **Enviar agendas futuras**. Os lembretes comuns não são duplicados por essa revisão.
