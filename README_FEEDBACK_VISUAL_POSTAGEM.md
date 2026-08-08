# Complemento V39 — Pesquisa visual + respostas + postagem Instagram

Este pacote deixa claro:

## Cliente verá

Rota:

`/feedback/[token]`

Fluxo:

1. CPF + data de nascimento
2. Código de 6 dígitos
3. Perguntas:
   - nota de 0 a 10
   - ponto que mais ajudou
   - comentário
   - autorização de uso do depoimento
4. Tela de obrigado

## Admin verá

Rota:

`/admin/feedbacks`

Tabela com:

- Cliente
- Nota
- Tipo
- Ponto forte
- Autorizou divulgação
- Botão Ver resposta
- Botão Gerar postagem Instagram

## Postagem Instagram

O botão “Gerar postagem Instagram” só deve ficar ativo quando:

`autorizou_divulgacao = true`

O card deve:

- ser quadrado 1080x1080;
- não mostrar dados sensíveis;
- não mostrar CPF;
- não mostrar passaporte;
- não mostrar número de visto;
- usar comentário autorizado;
- usar identidade visual da Resumindo Viagens.

## Importante

Este pacote prioriza visibilidade e entendimento dos botões.
O cockpit/agrupamento fica para depois.
