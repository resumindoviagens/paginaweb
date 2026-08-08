# Integração de emails pelo Brevo - Resumindo Viagens

Esta versão substitui o SMTP Gmail pela API do Brevo.

## O que foi mantido

- Os botões antigos de gerar/copiar modelos de email continuam no admin.
- Os botões novos de envio real continuam em paralelo.
- O fluxo dos clientes e links únicos não foi alterado.

## O que mudou

- O sistema não usa mais Nodemailer.
- O sistema envia emails pela API transacional do Brevo.
- O remetente recomendado é o domínio próprio, por exemplo: contato@resumindoviagens.com.br.

## Variáveis para configurar na Vercel

Em Vercel > Project > Settings > Environment Variables, configure:

BREVO_API_KEY=sua_chave_api_da_brevo
EMAIL_FROM=contato@resumindoviagens.com.br
EMAIL_FROM_NAME=Resumindo Viagens
EMAIL_REPLY_TO=contato@resumindoviagens.com.br

Também mantenha as variáveis que já existiam no projeto, como Supabase, senha admin e URL pública.

## Como configurar no Brevo

1. Crie/acesse sua conta Brevo.
2. Configure o domínio de envio da Resumindo Viagens no Brevo.
3. Valide os registros DNS solicitados pelo Brevo no painel onde seu domínio é gerenciado.
4. Crie ou valide o remetente contato@resumindoviagens.com.br.
5. Vá em SMTP & API e gere uma API Key.
6. Copie a API Key para a variável BREVO_API_KEY na Vercel.
7. Faça novo deploy na Vercel.
8. Teste primeiro com um cliente de teste.

## Observação importante

Não use senha do email, senha do Gmail ou senha do domínio. O Brevo usa API Key.

## Teste recomendado

1. Cadastre um cliente teste com seu próprio email.
2. Clique em "Enviar link por email (Brevo)".
3. Verifique se o email chegou corretamente.
4. Depois teste os demais modelos em "Enviar outros emails (Brevo)".
