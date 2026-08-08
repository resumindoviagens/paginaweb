# V117 — Operação DS-160 + Link estável

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260709_v117_ficha_operacao_ds160.sql`

## Correção do link de preparação

Os links de preparação passam a ser gerados preferencialmente com o ID estável do cliente:

`/preparacao/{client.id}`

Além disso, se um link antigo/token não for encontrado, a validação tenta localizar o cliente por CPF + data de nascimento. Isso evita “Link inválido ou expirado” quando o cliente usa um link antigo.

## Nova área Operação / DS-160

No card do cliente de visto, foi adicionado o botão:

`🗂 Operação / DS-160`

A tela possui:

### Dados comuns do grupo/família

- Consulado escolhido;
- Data prevista de ida;
- Quantidade de dias;
- Cidade/destino principal;
- Hotel escolhido;
- Endereço do hotel;
- Telefone do hotel;
- Observações gerais DS-160;
- Perguntas/respostas comuns.

### Dados individuais

- Nome como consta no passaporte;
- Sobrenome usado no DS-160;
- Número DS-160;
- Observações individuais.

## Resumo no card

O card mostra:

- Ficha DS-160: X/Y DS-160 + hotel definido/pendente;
- botão para copiar link de preparação.

## Centro de Ações

Quando o formulário estiver recebido e ainda não houver DS-160 salvo, a próxima ação passa a indicar:

`Preencher DS-160 e salvar número na Ficha Rápida`

## Mantém tudo da V116

Sem remover funcionalidades anteriores.
