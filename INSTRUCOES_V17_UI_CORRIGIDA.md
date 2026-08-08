# V17 — UI corrigida de processo, rastreios, renovação e favicon

## 1. O que deve aparecer no admin

No topo do admin deve aparecer:

**v17 — UI corrigida: consulado, rastreios, renovação e favicon ativos**

Se essa frase não aparecer, a Vercel ainda está mostrando uma versão antiga.

## 2. Onde cadastrar consulado, datas e rastreios

Na linha de cada cliente, clique em:

**Processo, datas e rastreios**

Nessa janela ficam:

- Cidade do consulado, com seleção fixa: Brasília, São Paulo, Rio de Janeiro, Porto Alegre e Recife;
- Data CASV;
- Data da entrevista no consulado;
- Data da videochamada;
- Rastreio do passaporte enviado ao cliente;
- Checkbox de renovação sem entrevista;
- Rastreio Sedex enviado pelo cliente à Resumindo;
- Link para o cliente informar o rastreio do Sedex.

## 3. Renovação sem entrevista

Quando marcar **Processo de renovação sem entrevista**, o cliente passa a ver, na própria página de acesso, um botão para informar o rastreio do Sedex.

Também aparece no admin um link para copiar/enviar ao cliente:

`/renovacao/[token]`

## 4. Supabase

Esta v17 não exige novas colunas além das já previstas na v16. Se algum campo não salvar, rode este SQL no Supabase:

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

## 5. Favicon

O favicon foi substituído pela imagem do avião enviada pelo cliente. Pode demorar para aparecer por cache do navegador. Teste com Ctrl+F5 ou aba anônima.
