# V118 — Cadastro combinado Visto + Passaporte

## Objetivo
Permitir cadastrar uma família que contratou Visto e Passaporte sem duplicar o cadastro único da pessoa.

## Implementado
- Novo checkbox **Esta família também contratou Passaporte** no cadastro principal.
- Exige seleção do grupo do processo de Visto.
- Ao cadastrar cada membro, cria o processo principal e um processo separado de Passaporte.
- Após o primeiro cadastro, mantém o grupo, o tipo de processo e a opção de Passaporte selecionados para agilizar os próximos membros da família.
- O grupo de Passaporte é criado/reutilizado automaticamente com o nome `<grupo do visto> — Passaporte`.
- Os dois processos usam `group_process_id` diferentes.
- Ambos os processos apontam para o mesmo `person_id` em `people`.
- O POST principal de clientes agora localiza/cria a pessoa única por CPF + data de nascimento.
- Proteção contra duplicidade do mesmo serviço, pessoa e grupo.
- A sincronização familiar não copia mais `tipo_processo` nem `feedback_service`.
- Defesa adicional: a sincronização só atinge membros do mesmo serviço do contato principal, mesmo em dados legados com grupo incorreto.

## Banco de dados
Não exige nova migration SQL. A implementação utiliza a estrutura `people.person_id` já introduzida na V111 e os grupos de processo existentes.
