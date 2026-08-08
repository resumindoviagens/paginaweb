Implementar V45 — grupo familiar com contato principal.

Requisitos:

1. Criar campos no Supabase:
   - grupo_familiar_id
   - grupo_familiar_nome
   - grupo_familiar_master
   - grupo_familiar_master_id
   - sincronizar_com_grupo

2. No cadastro/edição do cliente, adicionar:
   - Contato principal do grupo? Sim/Não
   - Sincronizar com grupo? Sim/Não
   - Grupo familiar / grupo de processo

3. No card do cliente, mostrar:
   - Contato principal do grupo
   - ou Vinculado ao grupo: [nome/id]

4. Criar botão:
   Sincronizar grupo

5. O botão só fica ativo no contato principal.

6. Ao clicar, confirmar:
   “Sincronizar etapas, barra de progresso, datas e rastreios deste contato principal com os demais membros do grupo?”

7. Sincronizar somente:
   - process_steps
   - current_step
   - etapa_atual
   - datas
   - rastreio
   - observações gerais
   - tipo/grupo de processo

8. Não sincronizar:
   - CPF
   - nascimento
   - e-mail
   - telefone
   - respostas do formulário
   - PDFs
   - feedbacks

9. Se membros tiverem etapas conflitantes, não resolver automaticamente.
   O master manda apenas quando você clicar em sincronizar.

10. Endpoint já criado:
   POST /api/admin/sync-family-group
