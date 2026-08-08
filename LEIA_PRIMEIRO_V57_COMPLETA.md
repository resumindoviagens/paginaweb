# V57 — pacote completo substituindo V55/V56

Use esta versão mesmo que você NÃO tenha executado a V55 nem enviado a V55 ao GitHub.

## Inclui tudo da V55

- Campo `Validade do visto` em **Editar dados**.
- Só habilita quando o cliente estiver com:
  - `Visto aprovado`; e
  - `Visto/passaporte devolvido`.
- Campo individual, não sincronizado com grupo familiar.
- Alerta no Admin:
  `Falta data da validade do visto`.

## Inclui tudo da V56

- Botão `WhatsApp pesquisa` no Admin.
- O botão só fica habilitado depois de marcar:
  `Visto/passaporte devolvido`.
- Mensagem pronta com link da pesquisa.
- Imagem estática:
  `public/feedback-preview-modelo.png`
- A imagem foi baseada em:
  `public/feedback-backgrounds/feedback-bg-01.png`
- A prévia já mostra:
  - 5 estrelas;
  - “Seu comentário aparecerá aqui.”;
  - Nota 10/10;
  - @resumindoviagens.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v57_validade_visto_whatsapp_preview.sql`

Esse SQL já inclui o que seria necessário da V55.
