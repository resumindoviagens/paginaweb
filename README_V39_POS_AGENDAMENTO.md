# V39 — Pós-Agendamento + Pesquisa de Satisfação

Este ZIP contém as alterações estruturais para a nova versão do sistema.

## Alterações incluídas

- Correção do erro da coluna ausente `data_final_processo`;
- nova etapa `passaporte_devolvido`;
- botão “Liberar pesquisa” sempre visível;
- botão bloqueado até marcar “Passaporte devolvido”;
- estrutura da camada “Preparação para Entrevista”;
- checklist operacional;
- tabela `feedbacks`;
- campos de controle de pesquisa em `clients`;
- logs internos;
- página pública `/feedback/[token]`;
- página admin `/admin/feedbacks`;
- segurança nível 2 planejada: CPF + nascimento + código de 6 dígitos.

## Arquivo para executar no Supabase

Execute:

`supabase/migrations/20260508_v39_pos_agendamento_feedback.sql`

no Supabase > SQL Editor.

## Ordem correta

1. Executar SQL no Supabase.
2. Copiar arquivos para o projeto.
3. Commit no GitHub.
4. Redeploy na Vercel.
5. Testar cliente fictício.

## Teste esperado

1. Criar cliente teste.
2. Ver botão “Liberar pesquisa” visível, mas bloqueado.
3. Marcar etapa “Passaporte devolvido”.
4. Confirmar que não aparece mais erro.
5. Ver botão “Liberar pesquisa” ativo.
6. Gerar link.
7. Abrir link em aba anônima.
8. Responder pesquisa.
9. Conferir resposta no Admin > Feedbacks.

## Observação

Se seu projeto já tiver arquivos com o mesmo nome, faça merge com cuidado.
Não substitua componentes funcionais sem comparar.
