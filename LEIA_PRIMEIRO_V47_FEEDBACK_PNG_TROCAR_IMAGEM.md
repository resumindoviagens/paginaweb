# V47 — Feedbacks com imagens PNG + botão Trocar imagem

## Alterações

1. O gerador de postagem agora busca imagens `.png`:
   - `feedback-bg-01.png`
   - ...
   - `feedback-bg-30.png`

2. A pasta correta continua sendo:

`public/feedback-backgrounds/`

3. Foi criado o campo no Supabase:

`feedbacks.background_index`

4. Foi criado o botão:

`Trocar imagem`

na página da postagem.

## Como funciona o botão Trocar imagem

Ao abrir:

`Admin > Feedbacks / Avaliações > Gerar imagem Instagram`

aparece o botão:

`Trocar imagem`

Cada clique troca a imagem do feedback para a próxima entre 1 e 30.

Isso permite corrigir casos como:
- comentário de homem com imagem de mulher;
- comentário de família com imagem individual;
- foto que não combinou com o texto.

## Importante

Depois que trocar, a escolha fica salva para aquele feedback.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260509_v47_feedback_background_png.sql`

## Imagens

Coloque as 30 imagens reais em:

`public/feedback-backgrounds/`

com estes nomes:

- feedback-bg-01.png
- feedback-bg-02.png
- ...
- feedback-bg-30.png
