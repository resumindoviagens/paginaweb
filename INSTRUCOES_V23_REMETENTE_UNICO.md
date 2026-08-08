# INSTRUCOES_V23_REMETENTE_UNICO.md

## Objetivo

A versão v23 padroniza TODOS os emails enviados pelo sistema para saírem com o remetente:

`alertas@resumindoviagens.com.br`

Isso vale para:

- emails automáticos enviados aos clientes;
- emails internos de alerta;
- email imediato de formulário iniciado/concluído;
- email imediato de videochamada;
- email diário de alertas.

As respostas continuam direcionadas para:

`contato@resumindoviagens.com.br`

## Variáveis recomendadas na Vercel

Adicione ou ajuste em Settings > Environment Variables:

```env
SYSTEM_EMAIL_FROM=alertas@resumindoviagens.com.br
SYSTEM_EMAIL_FROM_NAME=Resumindo Viagens
SYSTEM_EMAIL_REPLY_TO=contato@resumindoviagens.com.br
```

Mantenha também:

```env
BREVO_API_KEY=sua-chave-brevo
ALERT_EMAIL_TO=contato@resumindoviagens.com.br
```

## Importante

O remetente `alertas@resumindoviagens.com.br` precisa estar verificado no Brevo.

Não é necessário rodar novo SQL no Supabase para esta alteração.
