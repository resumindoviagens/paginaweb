# V97D — Passaporte, página de instruções e feedback mobile

## Correções

1. Cliente Passaporte mostra apenas emails de Passaporte.
2. Cliente Passaporte não consegue visualizar/enviar emails de visto.
3. Clientes de visto não visualizam emails de Passaporte.
4. Página /passaporte-instrucoes foi redesenhada com padrão visual mais próximo dos emails.
5. Postagem de feedback foi ajustada para uso no celular:
   - tamanho visual reduzido;
   - opção Feed/Story;
   - botão Gerar postagem na lista de feedbacks.

## SQL

Não há SQL novo.

Se ainda não executou, execute apenas:
supabase/migrations/20260510_v97_consolidada_passaporte_sem_anexo.sql

## Observação sobre login no celular

Esta versão não altera credenciais de login. Se aparecer "Invalid Login Credentials", teste primeiro:
- email/senha exatamente iguais aos usados no computador;
- sem espaço antes/depois;
- navegador anônimo no celular;
- limpar senha salva/autopreenchimento.
