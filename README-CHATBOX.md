# Resumindo Viagens — website com chatbox inteligente

Este pacote mantém o catálogo atual e acrescenta:

- chatbox com perguntas rápidas;
- respostas locais aprovadas para assuntos comuns;
- respostas por inteligência artificial para dúvidas abertas;
- bloqueio explícito de consulta, revelação ou alteração de dados de clientes;
- encaminhamento ao WhatsApp 11 98121-0932 quando a dúvida exige análise humana;
- envio do histórico completo de perguntas e respostas para contato@resumindoviagens.com.br ao encerrar;
- encerramento automático após 15 minutos sem interação;
- envio do resumo também quando a pessoa migra do chat para o WhatsApp.

## Proteção de dados

O código não contém conexão com `app.resumindoviagens.com.br`, Supabase, Gmail ou banco de clientes. O chat público não possui credenciais nem funções para consultar ou alterar processos. A chave da OpenAI e a chave do Brevo ficam somente nas variáveis de ambiente da Vercel.

## Como subir no GitHub

1. Extraia o ZIP.
2. No repositório do projeto `website`, substitua os arquivos atuais por todos os arquivos deste pacote.
3. Confirme que as pastas `api`, `lib` e `assets` foram enviadas inteiras.
4. Faça o commit na branch usada pela Vercel, normalmente `main`.

## Variáveis obrigatórias na Vercel

No projeto do WEBSITE — não no projeto `visto-seguro` — abra:

`Settings > Environment Variables`

Cadastre em Production, Preview e Development:

- `OPENAI_API_KEY`: sua chave da API da OpenAI.
- `OPENAI_MODEL`: `gpt-5.6-luna` (opcional; este é o valor padrão do pacote).
- `BREVO_API_KEY`: chave da API Brevo.
- `CHAT_EMAIL_TO`: `contato@resumindoviagens.com.br`.
- `CHAT_EMAIL_FROM`: `contato@resumindoviagens.com.br`.
- `CHAT_EMAIL_FROM_NAME`: `Chatbox Resumindo Viagens`.

O endereço definido em `CHAT_EMAIL_FROM` precisa estar autorizado como remetente no Brevo.

Depois de salvar as variáveis, faça um novo deploy em:

`Deployments > Redeploy`

## Teste técnico

Abra no navegador:

`https://resumindoviagens.com.br/api/health`

O resultado esperado é semelhante a:

```json
{
  "ok": true,
  "openaiConfigured": true,
  "brevoConfigured": true,
  "emailRecipientConfigured": true
}
```

Depois:

1. Abra o site em janela anônima.
2. Clique em **Fale com a Resumindo**.
3. Faça duas perguntas.
4. Clique em **Encerrar e enviar resumo**.
5. Confirme o recebimento em `contato@resumindoviagens.com.br`.

## Comportamento do envio do e-mail

O resumo é enviado quando:

- o visitante clica em **Encerrar e enviar resumo**;
- o visitante sai do chat para o WhatsApp;
- o chat permanece 15 minutos sem nova atividade.

Fechar apenas a aba do navegador não garante o envio, porque navegadores podem interromper chamadas de rede durante o fechamento. O botão de encerramento e o encaminhamento para WhatsApp são os meios confiáveis.

## Custos

As respostas aprovadas de assuntos comuns são locais e não chamam a OpenAI. Dúvidas abertas chamam a API da OpenAI e geram custo de uso na conta da API. O envio do histórico usa a API transacional do Brevo.


## CORREÇÃO V2 — CONFIGURAÇÃO SIMPLIFICADA

O remetente e o destinatário dos relatórios agora estão definidos diretamente
no código como contato@resumindoviagens.com.br.

Na Vercel, mantenha somente:
- OPENAI_API_KEY: chave verdadeira da OpenAI.
- OPENAI_MODEL: gpt-5-mini (opcional; se ausente, o sistema usa gpt-5-mini).
- BREVO_API_KEY: chave API v3 verdadeira e ativa do Brevo.

As variáveis CHAT_EMAIL_FROM, CHAT_EMAIL_TO e CHAT_EMAIL_FROM_NAME podem ser
excluídas da Vercel. Elas não são mais utilizadas por esta versão.

Depois de substituir os arquivos no GitHub, faça um novo deployment na Vercel.
