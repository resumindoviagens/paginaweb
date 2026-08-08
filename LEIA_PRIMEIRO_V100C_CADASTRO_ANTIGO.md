# V100C — Cadastro antigo com migração segura

## Correção

A limpeza da lista Cadastro Antigo agora é segura e em duas etapas.

## Como funciona

1. Botão “Migrar cadastro antigo”
   - marca os cadastros antigos como:
     - visto aprovado;
     - passaporte devolvido;
     - processo concluído;
     - pronto para arquivar.
   - NÃO tira automaticamente da lista antiga.

2. Botão “Conferir e limpar migrados”
   - primeiro mostra uma prévia;
   - informa quantos registros estão seguros;
   - só depois de confirmação altera `legacy_import = false`.

## Segurança

Nenhum cliente é apagado.

A limpeza só afeta registros que atendam TODOS os critérios:

- legacy_import = true;
- is_completed = true;
- visa_result = approved;
- stage_passport_returned = true;
- stage_ready_to_archive = true.

## SQL

Não há SQL novo.
