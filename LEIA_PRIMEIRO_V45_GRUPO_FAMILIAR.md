# V45 — Grupo familiar com Contato Principal e Sincronização Segura

## Objetivo

Permitir que famílias/grupos tenham um membro master, chamado:

**Contato principal do grupo**

E que as etapas/datas/rastreios possam ser espelhados nos demais membros sem alterar dados individuais.

---

## Conceito

### Contato principal
É o cliente que representa o grupo familiar, normalmente quem entrou em contato com você.

### Membros vinculados
São os demais clientes do mesmo grupo.

---

## Campos criados no banco

- `grupo_familiar_id`
- `grupo_familiar_nome`
- `grupo_familiar_master`
- `grupo_familiar_master_id`
- `sincronizar_com_grupo`

Também garante campos usados em processos/datas/rastreios:

- `data_inicio_processo`
- `data_final_processo`
- `observacoes_gerais`
- `tipo_processo`
- `grupo_processo`
- `rastreio_passaporte`
- `data_casv`
- `data_entrevista`
- `data_videochamada`
- `process_steps`
- `current_step`
- `etapa_atual`

---

## O que sincroniza

- etapas do processo;
- barra de progresso;
- etapa atual;
- datas de CASV/entrevista/videochamada;
- rastreio;
- tipo de processo;
- observações gerais;
- grupo de processo.

---

## O que NÃO sincroniza

- nome;
- CPF;
- nascimento;
- e-mail;
- telefone;
- respostas do formulário;
- PDF individual;
- feedback;
- aprovação/negativa individual, se o sistema tratar isso separadamente.

---

## Como usar

1. No cliente que representa a família, marque:
   `grupo_familiar_master = true`

2. Preencha o grupo:
   `grupo_familiar_id` ou `grupo_processo`

3. Nos demais membros, deixe o mesmo grupo.

4. Clique em:
   **Sincronizar grupo**

O sistema perguntará confirmação antes de aplicar.

---

## Arquivo SQL

Execute no Supabase:

`supabase/migrations/20260509_v45_grupo_familiar_master_sync.sql`

---

## Observação importante

Se hoje membros da mesma família estiverem em etapas diferentes, o sistema NÃO deve decidir sozinho.
A sincronização só acontece quando você clicar no botão e confirmar.

Isso evita sobrescrever dados importantes por engano.
