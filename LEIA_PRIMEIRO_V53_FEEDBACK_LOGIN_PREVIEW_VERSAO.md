# V53 — Feedback com login, prévia com foto, grupos coloridos e versão no Admin

## Alterações

1. Pesquisa de satisfação:
   - CPF e data de nascimento foram removidos de dentro do formulário.
   - Agora aparecem antes, como uma tela de login/acesso seguro.
   - Depois do acesso, o cliente vê apenas a pesquisa.

2. Prévia da postagem:
   - A pesquisa mostra uma prévia aproximada da postagem do Instagram.
   - A prévia usa a imagem:
     `public/feedback-backgrounds/feedback-bg-01.png`

3. Grupos de processo:
   - Reforçada a lógica de cor por grupo/família.
   - Todos os clientes do mesmo grupo usam a mesma cor.
   - As cores são limitadas e bem diferentes entre si.

4. Versão:
   - Admin atualizado para exibir:
     `v53 — Feedback login, grupos coloridos e versão atualizada`
   - Arquivo `VERSAO_ATUAL.txt` criado.
   - `package.json` atualizado para `5.3.0`.

## SQL

Não exige SQL novo se a V52 já foi executada.
