# V90 — Newsletter sem emails duplicados

## Correção

A newsletter agora considera email único.

Se 5 clientes da mesma família usam o mesmo email, a campanha coloca apenas 1 destinatário na fila.

## Critério de escolha do cliente representativo do email

1. Prioriza líder do grupo/processo quando houver campo compatível no banco.
2. Depois prioriza visto aprovado.
3. Depois prioriza processo concluído.
4. Depois prioriza o cadastro mais antigo.

## Painel Newsletter

Agora mostra:
- clientes com email;
- emails únicos;
- duplicados removidos;
- clientes sem email;
- elegíveis.

## SQL

Não precisa executar SQL novo se o SQL da V89 já foi executado.
