# V119 — Protocolo individual de Passaporte

## Antes do deploy
Execute no SQL Editor do Supabase:

```sql
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS passport_protocol text;
```

O arquivo completo está em:

`supabase/migrations/20260711_v119_protocolo_passaporte.sql`

## Funcionamento
- O campo **Protocolo do passaporte** aparece somente em processos de Passaporte.
- Local: **Processo, datas e rastreios**.
- O protocolo é individual por solicitante.
- Não é sincronizado entre os membros da família.
- Também aparece no PDF administrativo quando estiver preenchido.
