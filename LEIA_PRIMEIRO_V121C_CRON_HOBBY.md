# V121C — Cron compatível com Vercel Hobby

## Motivo da correção

O plano Hobby da Vercel não aceita cron com execução a cada 10 minutos.
A expressão `*/10 * * * *` impedia o deployment da V121B.

## Nova arquitetura

### Envio imediato após salvar

Ao cadastrar ou alterar:

- data e horário do CASV;
- data e horário do Consulado;
- videochamada;
- atendimento da Polícia Federal;

o sistema salva primeiro no Supabase e, em seguida, tenta enviar:

- e-mail de agenda ao cliente;
- cópia ao e-mail secundário em CC;
- arquivo(s) ICS;
- ICS interno da Resumindo Viagens.

Falha da Brevo não desfaz o salvamento.

### Cron diário

A rota `/api/cron/agenda-automation` passa a executar uma vez por dia:

`0 11 * * *`

Ela funciona como:

- recuperação de envios imediatos que falharam;
- envio de lembretes de compromissos próximos.

No plano Hobby, a Vercel pode executar em qualquer minuto dentro da hora programada.

## Crons do projeto

Todos os crons configurados em `vercel.json` executam no máximo uma vez por dia, sendo compatíveis com o plano Hobby.

## Banco de dados

Não há SQL adicional na V121C.

Permanece necessário executar o SQL da V121 caso ainda não tenha sido aplicado:

`supabase/migrations/20260726_v121_automacoes_horarios_formulario.sql`

## Testes importantes após publicar

1. Confirmar que o deployment fica como `Ready`.
2. Confirmar que o painel mostra V121C.
3. Cadastrar CASV e Consulado com data e hora.
4. Verificar e-mail principal, CC e arquivos ICS.
5. Testar Recife ou Porto Alegre somente com compromisso no Consulado.
6. Testar atendimento da Polícia Federal.
7. Conferir os registros de auditoria em caso de falha da Brevo.
