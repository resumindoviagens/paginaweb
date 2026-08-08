# V14 — gestão de processos, família, renovação e rastreio

Antes de usar a V14, execute este SQL no Supabase > SQL Editor > New Query > Run.

Cole SOMENTE o bloco abaixo:

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
```

## O que mudou

- Data de nascimento ficou identificada no cadastro inicial.
- Cidade do consulado agora é lista fixa: Brasília, São Paulo, Rio de Janeiro, Porto Alegre e Recife.
- Apenas um menu/popup abre por vez no admin.
- Rastreio do passaporte foi incluído em Datas e alertas.
- Email 09 usa automaticamente o rastreio salvo no cliente.
- PDF administrativo passa a mostrar rastreio, grupo familiar e dados de renovação.
- Cliente pode ser marcado como renovação sem entrevista.
- Clientes de renovação possuem link específico para informar rastreio do Sedex: /renovacao/[token].
- Clientes podem ser vinculados por grupo familiar/processo.
- Clientes podem ser marcados como concluídos e aparecem na aba Processos concluídos.
- É possível marcar cadastro de controle sem envio de formulário, útil para crianças menores quando você mesmo preencherá o DS-160.

## Observação sobre Correios

O botão de rastreio tenta abrir o site dos Correios com o código no endereço. O site dos Correios pode, em alguns momentos, ignorar o código e pedir nova digitação. Por isso o código também fica visível para copiar.
