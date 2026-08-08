# V16 — gestão completa: SQL correto e conferência de deploy

## 1. SQL correto para Supabase

Cole SOMENTE o bloco abaixo no SQL Editor do Supabase.

> Atenção: a tabela correta do seu projeto é `clients`, não `clientes`.

```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS interview_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS casv_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS video_call_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS consulate_city TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS passport_tracking_code TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_sedex_tracking TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS family_group TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS no_form_required BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
```

Se aparecer que a coluna já existe, não tem problema.

## 2. Como saber se a V16 entrou de verdade

Depois do deploy, no topo do admin deve aparecer:

**v16 — gestão de processos, grupos, rastreios e alertas ativa**

Se essa frase não aparecer, você não está vendo a V16 publicada.

## 3. O que esta versão contém

- Data de nascimento identificada no cadastro e edição.
- Cidade do consulado com seleção fixa em Datas e alertas.
- Apenas um menu aberto por vez.
- Campo de rastreio do passaporte em Datas e alertas.
- Email 09 usa o rastreio salvo.
- PDF mostra rastreio do passaporte, grupo familiar e Sedex do cliente.
- Renovação sem entrevista com destaque.
- Link para cliente informar rastreio do Sedex em processo de renovação.
- Grupo familiar/processo para vincular familiares.
- Cadastro de controle sem envio de formulário.
- Abas: processos em andamento e concluídos.
- Botão marcar concluído/reabrir.
- Favicon em `/public/favicon.ico`.
