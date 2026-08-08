# V38 — Correção modelos de email Orlando

## Corrigido

- Botão "Gerar modelos de email" agora força o mesmo cabeçalho Orlando do envio automático.
- Criado arquivo novo: /email-headers/header-orlando-v38.png
- Todos os templates apontam para esse novo arquivo, evitando cache antigo.
- Página /email/[token] configurada como dinâmica/sem cache.
- Links do admin para modelos agora incluem &v=v38-orlando.

## Testar

1. Abrir admin.
2. Gerar modelo de email 01.
3. Conferir cabeçalho Orlando.
4. Gerar modelo de email 06.
5. Conferir mesmo cabeçalho Orlando.
6. Enviar email automático de teste.

## Importante

Se ainda aparecer imagem antiga, abrir em aba anônima ou limpar cache do navegador.
