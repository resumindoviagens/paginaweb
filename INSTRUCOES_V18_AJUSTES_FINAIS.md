# V18 — ajustes finais de admin, rastreio, ordenação e PDF manual

## O que mudou

- Versão visível no topo do admin: **v18 — ajustes finais: cadastro, rastreio, ordenação, PDF manual e favicon ativo**.
- Cadastro inicial agora permite marcar:
  - **Cadastro de controle — não enviar formulário**;
  - **Processo de renovação sem entrevista**;
  - **Grupo familiar / processo**.
- A marcação de renovação ficou centralizada em **Editar dados**.
- Ao marcar renovação em **Editar dados**, aparece o campo para informar o **Rastreio Sedex enviado pelo cliente para a Resumindo**.
- Removido o link/página para o cliente informar rastreio de Sedex; o rastreio passa a ser informado internamente no admin.
- O painel **Processo, datas e rastreios** fica focado em:
  - cidade do consulado;
  - data CASV;
  - data da entrevista;
  - data da videochamada;
  - rastreio do passaporte enviado ao cliente.
- Corrigido o campo de busca para nome, CPF, e-mail, grupo familiar, cidade e rastreios.
- Criada ordenação por:
  - cadastro mais recente;
  - cadastro mais antigo;
  - ordem alfabética;
  - grupo familiar;
  - data da entrevista;
  - data CASV;
  - data da videochamada.
- O Email 09 só pode ser enviado automaticamente quando houver rastreio do passaporte informado.
- O PDF de respostas só mostra consulado, grupo familiar e rastreios se esses campos estiverem preenchidos.
- Novo botão: **PDF para preencher à mão**, útil para clientes avessos à tecnologia.
- Favicon substituído pela imagem do avião e nuvem com fundo branco.

## Supabase

Esta versão não exige novas colunas além das já previstas na v16/v17. Se algum campo não salvar, rode apenas este SQL:

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
