# V121A — correção de publicação do formulário

## Motivo

A V121 continha as alterações solicitadas no código, porém havia uma declaração JavaScript duplicada em `app/acesso/[token]/page.js`. Isso impedia o build e fazia a Vercel manter a versão anterior em produção. Por isso, as telas continuavam exibindo o formulário antigo.

## Correções

- corrigido o erro de build;
- removida a numeração de “Informações prévias”;
- “Upload de documentos (implementação)” permanece visível, porém desabilitado;
- a numeração do formulário começa em “1. Início e Dados do Solicitante”;
- confirmados os desdobramentos 2.18.a–2.18.f, 7.3.a–7.3.f, 7.11.a–7.11.g e 7.13.a–7.13.g;
- preservadas as regras de bloqueio automático;
- preservada a migração de respostas antigas para o primeiro campo do novo endereço;
- removidas pequenas duplicidades de interface encontradas durante a revisão.

## SQL

Não há SQL adicional nesta correção. Caso ainda não tenha executado o SQL da V121, execute:

`supabase/migrations/20260726_v121_automacoes_horarios_formulario.sql`
