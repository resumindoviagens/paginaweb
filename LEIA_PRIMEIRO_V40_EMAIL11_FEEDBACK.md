# V40 — Correção real do ciclo: Email 11 e pesquisa de satisfação

Este pacote NÃO é apenas patch solto. Ele foi gerado sobre a base v38 enviada e altera os arquivos reais que alimentam os botões atuais.

## O que foi alterado de verdade

### 1. `lib/emailTemplates.js`
Foi adicionado o modelo:

`11 - Enviar pesquisa de satisfação`

Isso faz o item aparecer automaticamente em:
- Gerar modelos de email (copiar)
- Enviar emails automáticos

porque ambos usam `EMAIL_TEMPLATES.map(...)`.

### 2. `app/api/admin/send-email/route.js`
Quando o modelo 11 é enviado automaticamente:
- gera token de pesquisa;
- salva em `clients.feedback_token`;
- envia email com link `/feedback/[token]`.

### 3. `app/email/[token]/page.js`
Quando abrir o modelo manual do email 11:
- também gera token de pesquisa se ainda não existir;
- mostra o link correto dentro do modelo de email.

### 4. Nova página pública
`/feedback/[token]`

Cliente responde a pesquisa com:
- CPF
- data de nascimento
- nota NPS
- ponto forte
- comentário
- autorização de divulgação

### 5. Nova área admin
`/admin/feedbacks`

Você vê:
- resposta do cliente;
- nota;
- comentário;
- autorização;
- botão “Gerar postagem Instagram”.

### 6. Alerta no card do cliente
Quando a pesquisa for respondida:
`Avaliação recebida: nota X / 10`

## Arquivo SQL para Supabase

Execute:

`supabase/migrations/20260508_v40_feedback_email11.sql`

## Ordem correta

1. Executar SQL no Supabase.
2. Substituir/copiar arquivos no projeto.
3. Commit.
4. Push.
5. Redeploy na Vercel.
6. Abrir Admin e testar os dois botões:
   - Gerar modelos de email (copiar)
   - Enviar emails automáticos

O item 11 deve aparecer nos dois.
