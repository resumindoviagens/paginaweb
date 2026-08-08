# V46 — Grupo familiar realmente integrado

Esta versão corrige a V45, que criou arquivos mas não renderizou o botão no Admin.

## Agora deve aparecer

No card de cada cliente, junto dos botões:

`Sincronizar grupo`

O botão fica:
- bloqueado se o cliente não for Contato principal;
- bloqueado se não tiver Grupo de processo;
- ativo quando for Contato principal + tiver Grupo de processo.

## Onde marcar o Contato principal

Admin > cliente > Editar dados:

- Contato principal do grupo familiar
- Sincronizar este membro com o grupo

## Confirmação automática

Quando alterar:
- Etapas do processo;
- Processo, datas e rastreios;

se o cliente for Contato principal, o sistema perguntará:

“Deseja sincronizar agora com os demais membros do grupo?”

## O que sincroniza

- Taxa gerada;
- Taxa paga;
- Datas agendadas;
- Entrevista realizada;
- Passaporte devolvido;
- CASV;
- Entrevista;
- Videochamada;
- Consulado;
- Rastreio;
- Observações gerais;
- Tipo de processo.

## O que NÃO sincroniza

- Nome;
- CPF;
- nascimento;
- e-mail;
- telefone;
- respostas do formulário;
- PDFs;
- feedbacks;
- resultado individual do visto.

## SQL

Execute no Supabase:

`supabase/migrations/20260509_v46_grupo_familiar_sync_real.sql`
