# Publicação da Orientação Resumindo V4.6

## 1. Backup

Antes da atualização, salve uma cópia do repositório atual e exporte as tabelas do projeto Supabase.

## 2. Atualização do Supabase

No **SQL Editor** do projeto já utilizado pelo site, execute integralmente:

```text
supabase/ATUALIZACAO-V4.6.sql
```

O script é idempotente e acrescenta:

- `visitor_phone` e `visitor_email` em `chat_sessions`;
- `report_reason` para registrar o motivo do encerramento;
- RPC `create_guidance_session`;
- RPC `touch_guidance_session`.

Depois, em **Authentication**, confirme que o acesso anônimo permanece habilitado. A orientação usa uma identidade temporária protegida pelas políticas RLS existentes.

## 3. Variáveis da Vercel

Confira as variáveis de produção:

```text
OPENAI_API_KEY
OPENAI_MODEL
BREVO_API_KEY
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
CRON_SECRET
```

Use no `CRON_SECRET` uma sequência aleatória longa, sem quebra de linha. Não coloque chaves secretas no HTML, em `script.js` ou no GitHub.

## 4. Publicação

Substitua os arquivos do repositório pelos arquivos desta pasta e faça o deploy de produção. O `vercel.json` mantém uma rotina diária de recuperação e limpeza. Os disparos imediatos por WhatsApp, inatividade e saída da página são feitos pelo navegador e pelas APIs do projeto.

## 5. Validação técnica

Abra:

```text
/api/health
```

O retorno deve conter:

```json
{
  "ok": true,
  "version": "orientacao-resumindo-v4.6",
  "brevoConfigured": true,
  "supabaseUrlConfigured": true,
  "supabasePublishableConfigured": true,
  "supabaseSecretConfigured": true
}
```

## 6. Teste funcional mínimo

1. Abra o site em janela anônima.
2. Confirme que existe apenas o botão **Tire suas dúvidas** no canto.
3. Confirme que não existem tópicos ou perguntas sugeridas.
4. Tente iniciar sem nome e verifique a validação.
5. Inicie com nome e sem contato; faça uma pergunta.
6. Faça outro teste com telefone e e-mail.
7. Clique em **Aprofundar pelo WhatsApp** e confira o e-mail recebido.
8. Confirme no e-mail a pergunta integral e a resposta correspondente.
9. Inicie nova orientação, deixe sem interação por 15 minutos e confira o encerramento.
10. Acesse `/admin` e confirme a visualização do registro e dos contatos opcionais.

## 7. Recuperação

Caso o e-mail não chegue:

- confira `BREVO_API_KEY` e os logs de `/api/end-session`;
- confira se `CRON_SECRET` está definido;
- confira os logs de `/api/cleanup` no deploy de produção;
- verifique no Supabase os campos `report_sent_at`, `report_message_id` e `report_reason` da sessão.
