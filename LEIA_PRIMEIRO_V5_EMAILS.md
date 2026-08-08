# Ajuste v5 — emails bonitos para copiar e enviar

Esta versão corrige o problema da tela de modelos de email.

## O que mudou

1. A tela **Gerar modelos de email (copiar)** agora abre somente o corpo do email, sem cabeçalho explicativo, sem lista de botões e sem textarea.
2. Assim, ao abrir um modelo, você pode usar **Ctrl+A** e depois **Ctrl+C** para copiar o email visual e colar no Gmail.
3. O mesmo HTML visual é usado nos envios reais pela Brevo.
4. O layout foi padronizado com visual mais profissional, assinatura e trio de ouro: WhatsApp, Instagram e Email.
5. O logo passa a ser usado automaticamente pelo caminho `/logo.png` quando o sistema souber o domínio do site.

## Importante

Os botões antigos de gerar/copiar modelo continuam existindo no admin.
Os botões novos de envio real pela Brevo também continuam em paralelo.

## DNS/Brevo

Este ZIP não depende de o Brevo já estar autenticado para corrigir o visual dos modelos. A autenticação do domínio continua sendo um ajuste externo de DNS.
