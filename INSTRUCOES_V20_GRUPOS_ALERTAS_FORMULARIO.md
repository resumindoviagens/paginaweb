# V20 — grupos de processo + alertas de formulário

## 1) SQL para rodar no Supabase

Abra o Supabase > SQL Editor > New Query e cole APENAS o SQL abaixo:

```sql
CREATE TABLE IF NOT EXISTS grupos_processo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  consulate_city TEXT DEFAULT '',
  casv_date DATE,
  interview_date DATE,
  video_call_date DATE,
  passport_tracking_code TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS group_process_id UUID REFERENCES grupos_processo(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS family_group TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS no_form_required BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_sedex_tracking TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS passport_tracking_code TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS consulate_city TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS casv_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS interview_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS video_call_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS completion_date DATE;
```

## 2) Variáveis de ambiente na Vercel

A v20 usa o Brevo para envio automático e alertas internos.

Confira se já existem:

- BREVO_API_KEY
- EMAIL_FROM=contato@resumindoviagens.com.br
- NEXT_PUBLIC_SITE_URL=https://seu-dominio-ou-url-da-vercel

Opcional, mas recomendado:

- ALERT_EMAIL_TO=contato@resumindoviagens.com.br
- CRON_SECRET=crie_uma_senha_grande_qualquer

## 3) Alertas novos

A v20 inclui:

- alerta individual quando cliente inicia o formulário;
- alerta individual quando cliente conclui o formulário;
- email interno imediato para contato@resumindoviagens.com.br quando o cliente clica em Enviar definitivamente;
- email diário de alertas via Vercel Cron.

## 4) Como testar

1. Suba a v20 na Vercel.
2. Confira se o admin mostra: v20 — grupos de processo, alertas individuais e email interno ativo.
3. Crie um grupo de processo.
4. Vincule um cliente ao grupo.
5. Abra o formulário de um cliente teste para ver o status ficar Em preenchimento.
6. Envie definitivamente o formulário teste e confira o email interno.
