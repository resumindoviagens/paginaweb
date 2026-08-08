# V70 — Correção dos balões explicativos

## Correção aplicada

O sistema estava salvando os balões explicativos,
mas o Next.js mantinha resposta em cache.

Agora:

- APIs dos balões estão como force-dynamic;
- alterações aparecem imediatamente;
- painel recarrega automaticamente após salvar.

## SQL

Não precisa executar SQL novo.
