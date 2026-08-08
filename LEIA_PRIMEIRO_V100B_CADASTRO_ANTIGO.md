# V100B — Correção Cadastro Antigo

Na V100A, os cadastros antigos eram migrados como aprovados/concluídos, mas continuavam com `legacy_import = true`, por isso ainda apareciam na lista Cadastro Antigo.

## Agora

1. “Migrar cadastro antigo” também muda:
   - legacy_import = false

2. Novo botão temporário:
   - “Limpar migrados da lista antiga”

Use este botão uma vez para retirar da lista antiga os processos que você já migrou na V100A.

## SQL

Não há SQL novo.
