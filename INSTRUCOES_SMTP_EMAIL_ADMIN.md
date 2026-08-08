# Integração de email SMTP Gmail no Admin

Esta versão adiciona envio de email diretamente pelo painel administrativo, sob comando manual do administrador.

## O que foi adicionado

- Dependência `nodemailer` no `package.json`.
- Arquivo `lib/emailTemplates.js` com os modelos prontos de email.
- Rota segura `app/api/admin/send-email/route.js` para envio via SMTP Gmail.
- Botões no admin:
  - `Enviar link por email`
  - menu `Outros emails`, com os modelos:
    - Proposta / apresentação
    - Enviar link do formulário
    - Enviar taxa / boleto
    - Agendamento confirmado
    - Instruções completas
    - Preparação para videochamada
    - Boa sorte na semana
    - Visto aprovado
    - Enviar rastreio
    - Pós-venda / próximos serviços

## Variáveis de ambiente necessárias na Vercel

Configure em Project Settings > Environment Variables:

```env
GMAIL_SMTP_USER=contato@resumindoviagens.com.br
GMAIL_SMTP_APP_PASSWORD=SENHA_DE_APP_DO_GOOGLE
EMAIL_FROM=contato@resumindoviagens.com.br
EMAIL_FROM_NAME=Resumindo Viagens
NEXT_PUBLIC_SITE_URL=https://SEU-DOMINIO.vercel.app
NEXT_PUBLIC_VIDEO_FORMULARIO=https://link-do-video-de-preenchimento
NEXT_PUBLIC_VIDEO_ENTREVISTA=https://link-do-video-de-entrevista
NEXT_PUBLIC_VIDEO_POS_VENDA=https://link-do-video-pos-venda
```

## Importante sobre Gmail

Não use a senha normal do Gmail. Use uma senha de app do Google.
Para gerar senha de app, a conta Google precisa ter verificação em duas etapas ativada.

## Como funciona no admin

1. Cadastre ou abra um cliente com email preenchido.
2. Clique em `Enviar link por email` para enviar o link individual do formulário.
3. Ou abra `Outros emails` e selecione o modelo desejado.
4. O sistema confirma antes de enviar.
5. Depois do envio, registra no log do cliente a ação `email_sent`.

## Anexos do consulado

Esta versão ainda não faz upload/anexo automático de documentos do consulado.
Para anexar `Application`, `Confirmation` e `Agendamento`, a próxima etapa recomendada é criar:

- tabela `client_documents` no Supabase;
- bucket no Supabase Storage;
- botões de upload no admin;
- seleção automática de anexos no envio do email de instruções.

