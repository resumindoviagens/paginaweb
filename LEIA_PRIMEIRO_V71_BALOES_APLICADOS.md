# V71 — Balões aplicados no formulário

## Correção

Na V70 os balões eram salvos no banco, mas o formulário do cliente ainda renderizava o texto original do `formSchema.js`.

Agora:
- o formulário realmente aplica `helpOverrides[field.id]`;
- o endpoint público de balões usa `no-store`;
- o painel força recarregamento sem cache.

## Como testar

1. Abra `/admin/baloes`.
2. Edite o balão da pergunta `10.1 — observacoes`.
3. Clique em Salvar.
4. Abra o formulário do cliente novamente.
5. Vá até a pergunta 10.1.
6. O balão deve exibir o novo texto.

## SQL

Não precisa executar SQL novo se a tabela da V68 já existe.
