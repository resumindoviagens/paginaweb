# V22 — relatórios profissionais e exportação

## O que entrou nesta versão

- Remetente dos alertas internos passa a priorizar `alertas@resumindoviagens.com.br`.
- Novo botão global **Relatórios** no admin.
- Painel com indicadores: total, em andamento, concluídos, aprovados e negados.
- Relatório geral com status automático, etapa atual, datas, grupo, consulado, progresso e tempo do processo.
- Exportação CSV compatível com Excel, incluindo colunas semelhantes ao controle antigo.
- Campos adicionais no cliente: tipo de processo, data de início, data final e observações gerais.
- Ao marcar visto/passaporte devolvido, o sistema preenche data final automaticamente se ainda estiver vazia.

## Variáveis recomendadas na Vercel

Configure em Project Settings > Environment Variables:

ALERT_EMAIL_FROM=alertas@resumindoviagens.com.br
ALERT_EMAIL_FROM_NAME=Resumindo Viagens - Alertas
ALERT_EMAIL_REPLY_TO=contato@resumindoviagens.com.br
ALERT_EMAIL_TO=contato@resumindoviagens.com.br

Mesmo sem configurar ALERT_EMAIL_FROM, esta versão já usa `alertas@resumindoviagens.com.br` como padrão para alertas internos.

## SQL completo e seguro para Supabase

Cole apenas o SQL abaixo no SQL Editor do Supabase. Não cole linhas com `#`.

```sql
CREATE TABLE IF NOT EXISTS grupos_processo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  consulate_city TEXT,
  casv_date DATE,
  interview_date DATE,
  video_call_date DATE,
  passport_tracking_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS group_process_id UUID;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS no_form_required BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS passport_tracking_code TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_sedex_tracking TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS family_group TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS consulate_city TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS casv_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS interview_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS video_call_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stage_ds160_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stage_fee_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stage_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stage_dates_scheduled BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stage_interview_done BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS visa_result TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stage_passport_returned BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tipo_processo TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS data_inicio_processo DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS data_final_processo DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS observacoes_gerais TEXT;
```

## Validação depois do deploy

No topo do admin deve aparecer:

`v22 — relatórios, exportação e alertas por email ativos`

Depois teste:

1. Abrir **Relatórios**.
2. Ver os indicadores.
3. Exportar CSV/Excel.
4. Conferir se os dados de clientes com grupo e sem grupo aparecem.
5. Conferir se alertas internos continuam chegando com remetente `alertas@resumindoviagens.com.br`.
