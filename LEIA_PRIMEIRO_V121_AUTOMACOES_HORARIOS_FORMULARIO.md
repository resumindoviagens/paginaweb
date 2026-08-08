# V121 — Automações de e-mail, horários reais e formulário

## Escopo

Esta versão implementa somente as automações de e-mail e alterações de formulário. O agente interno da Resumindo Viagens **não foi implementado**.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260726_v121_automacoes_horarios_formulario.sql`

## Automação de agenda

- CASV e Consulado agora possuem data e horário completos.
- Os horários aparecem no e-mail automático e no arquivo ICS.
- O envio ocorre pelo cron após janela de segurança de aproximadamente 5 a 10 minutos.
- O salvamento não depende da Brevo.
- Em grupos familiares, o e-mail compartilhado é programado somente para o contato principal, evitando duplicidades.
- E-mail secundário é preenchido automaticamente em CC.
- ICS usa identificador estável por cliente e tipo de compromisso.
- Lembretes continuam sendo processados pelo cron.

## Recife e Porto Alegre

- Tratados como cidades de compromisso único.
- O campo CASV fica oculto e não é exigido.
- Apenas data e horário do compromisso no Consulado são necessários.
- O sistema não gera erro pela ausência de CASV.

## Formulário

- Aba 2 Upload de documentos desabilitada e identificada como “(implementação)”.
- Pergunta 2.18 dividida em Endereço 1, Endereço 2, Cidade, UF, CEP e País, mantendo o bloqueio vinculado ao pagador.
- Pergunta 7.3 dividida em campos de endereço.
- Perguntas 7.11 e 7.13 divididas em nome da instituição e campos de endereço.
- Numeração em subitens a, b, c etc. preservada também nos PDFs.
- Respostas antigas dos campos consolidados são reaproveitadas no primeiro novo campo para evitar perda visual.

## Configuração Vercel

Foi acrescentado o cron `/api/cron/agenda-automation` a cada 10 minutos. Confira se o plano da Vercel permite essa frequência; caso contrário, ajuste a frequência mantendo a rota ativa.

## Testes recomendados

1. São Paulo: cadastrar CASV e Consulado com horários diferentes.
2. Recife: cadastrar somente compromisso consular e confirmar ausência de erro de CASV.
3. Porto Alegre: repetir o teste de compromisso único.
4. Confirmar e-mail principal e CC automático.
5. Conferir horário no corpo do e-mail e no ICS.
6. Alterar horário e confirmar novo envio sem bloquear o salvamento.
7. Conferir numeração e bloqueios das perguntas 2.18, 7.3, 7.11 e 7.13.
8. Confirmar que Upload de documentos não pode ser aberto.
