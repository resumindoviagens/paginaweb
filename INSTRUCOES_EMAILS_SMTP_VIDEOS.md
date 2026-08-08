# Integração de emails no admin - Resumindo Viagens

## O que foi incluído

- Integração SMTP Gmail via Nodemailer.
- Botão no admin para enviar email do formulário.
- Menu "Outros emails" com modelos prontos.
- Todos os emails possuem o trio de ouro: WhatsApp, Instagram e Email.
- Campos de vídeo por variável de ambiente.
- Arquivo `.env.example` com todas as variáveis necessárias.

## Variáveis obrigatórias na Vercel

Configure em Project Settings > Environment Variables:

```env
GMAIL_SMTP_USER=contato@resumindoviagens.com.br
GMAIL_SMTP_APP_PASSWORD=senha_de_app_google_sem_espacos
EMAIL_FROM=contato@resumindoviagens.com.br
EMAIL_FROM_NAME=Resumindo Viagens
NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app
NEXT_PUBLIC_RV_WHATSAPP=https://wa.me/5511981210932
NEXT_PUBLIC_RV_INSTAGRAM=https://www.instagram.com/resumindoviagens
NEXT_PUBLIC_RV_EMAIL_LINK=mailto:contato@resumindoviagens.com.br
NEXT_PUBLIC_VIDEO_PROPOSTA=https://link-do-video
NEXT_PUBLIC_VIDEO_FORMULARIO=https://link-do-video
NEXT_PUBLIC_VIDEO_ENTREVISTA=https://link-do-video
NEXT_PUBLIC_VIDEO_POS_VENDA=https://link-do-video
```

## Como gerar senha de app no Gmail

1. Ative a verificação em duas etapas na conta Google.
2. Acesse Segurança > Senhas de app.
3. Crie uma senha para o app do sistema.
4. Copie a senha de 16 caracteres.
5. Cole em `GMAIL_SMTP_APP_PASSWORD`, sem espaços.

Não use a senha normal do Gmail no sistema.

## Onde colocar os vídeos

Não anexe vídeos diretamente ao email. Emails com vídeo anexado ficam pesados e podem falhar ou cair em spam.

O ideal é colocar no email um botão "Assistir vídeo" apontando para uma página ou link público.

Ordem recomendada:

1. Página do próprio site `/videos/...` com o vídeo incorporado.
2. YouTube não listado, se aceitar a aparência da plataforma.
3. Vimeo, se quiser aparência mais profissional.
4. Google Drive apenas como solução provisória.

## Google Drive é viável?

Sim, é viável para começar, desde que o arquivo esteja com compartilhamento "qualquer pessoa com o link pode visualizar".

Mas não é a melhor solução definitiva porque:

- o visual é menos profissional;
- pode exigir permissões se configurado errado;
- a experiência no celular pode variar;
- não é ideal para email marketing ou atendimento recorrente.

## Modelos incluídos

- Proposta / apresentação
- Serviço fechado / próximos passos
- Enviar link do formulário
- Lembrete de formulário pendente
- Enviar taxa / boleto
- Taxa paga / escolher datas
- Agendamento confirmado
- Oferta entrega do passaporte
- Instruções completas
- Preparação para videochamada
- Boa sorte na semana
- Visto aprovado
- Visto não aprovado
- Enviar rastreio
- Passaporte recebido / encerramento
- Pós-venda / próximos serviços

## Anexos do consulado

Ainda não foi incluído upload/armazenamento de Application, Confirmation e Agendamento.

Próxima etapa recomendada:

- criar upload por cliente no admin;
- salvar arquivos no Supabase Storage;
- permitir envio do email "Instruções completas" com anexos selecionados.

## Atualização de segurança operacional - botões duplicados

Nesta versão, os botões antigos de geração/cópia de modelos de email foram mantidos no admin.

No painel de cada cliente existem agora duas áreas separadas:

1. **Gerar modelos de email (copiar)**
   - Não envia nada automaticamente.
   - Abre uma tela de pré-visualização do modelo.
   - Serve como método antigo/seguro durante a fase de transição.

2. **Enviar emails (SMTP)**
   - Envia email real pelo Gmail SMTP configurado nas variáveis de ambiente.
   - Antes de enviar, o sistema pede confirmação.
   - Use apenas depois de conferir se o SMTP está configurado corretamente.

Recomendação: durante os primeiros testes, use um cliente interno ou um email seu para validar os envios reais antes de enviar para clientes.
