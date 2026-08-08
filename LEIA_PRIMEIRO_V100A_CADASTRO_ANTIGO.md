# V100A — Cadastro antigo aprovado e feedback

## Inclui

1. Remove botão temporário “Enviar agendas futuras”.
2. Cria botão temporário “Migrar cadastro antigo”.
   - Aplica somente em clientes com legacy_import = true.
   - Marca:
     - visto aprovado;
     - passaporte devolvido;
     - processo concluído;
     - pronto para arquivar.
3. Cria botão temporário “Enviar avaliações antigas”.
   - Envia pesquisa de satisfação apenas para cadastros antigos:
     - com email válido;
     - ainda sem pesquisa enviada;
     - ainda sem pesquisa respondida.

## Segurança

A migração é limitada a `legacy_import = true`, ou seja, não altera clientes atuais criados manualmente.

## SQL

Não há SQL novo.
