# Publicação da Orientação Resumindo V4.7

## 1. Backup

Faça backup do repositório atual e do projeto Supabase antes da publicação.

## 2. Atualização do banco

No SQL Editor do Supabase usado pelo site, execute:

```text
supabase/ATUALIZACAO-V4.7.sql
```

O script cria a mensagem editável de segurança e cadastra a resposta específica sobre chances de aprovação do visto americano. Ele pode ser executado novamente sem duplicar a pergunta.

## 3. Variáveis da Vercel

Necessárias:

```text
BREVO_API_KEY
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
CRON_SECRET
```

Não são mais necessárias:

```text
OPENAI_API_KEY
OPENAI_MODEL
```

A v4.7 não chama modelo generativo para responder visitantes.

## 4. Publicação

Substitua o conteúdo da raiz do repositório pelos arquivos desta pasta e aguarde o deploy da Vercel.

## 5. Verificação

Abra `/api/health`. O retorno deve incluir:

```json
{
  "version": "orientacao-resumindo-v4.7",
  "answerMode": "approved-literal-only",
  "generativeAnswersEnabled": false
}
```

## 6. Teste da resposta sobre aprovação

Pergunte exatamente:

```text
Gostaria de saber quais são minhas chances de ter o visto americano aprovado?
```

A resposta deve ser a cadastrada pelo SQL V4.7, sem qualquer alteração ou complemento.

## 7. Teste de ausência de resposta

Faça uma pergunta que não exista na base. O site deve apresentar somente a mensagem de segurança configurada no painel, sem aproveitar uma resposta aproximada.

## 8. Teste de notificações

1. Inicie a orientação, informe um nome e não faça pergunta.
2. Aguarde a inatividade ou encerre.
3. Confirme que nenhum e-mail foi enviado.
4. Repita, desta vez fazendo uma pergunta.
5. Confirme que o relatório foi enviado e contém a pergunta e a resposta integrais.
6. Clique no WhatsApp sem fazer pergunta e confirme que o pedido explícito de contato pode gerar relatório.
