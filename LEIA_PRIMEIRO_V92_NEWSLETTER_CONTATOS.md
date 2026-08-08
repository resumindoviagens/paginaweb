# V92 — Newsletter com contatos independentes

## Origem da atualização

Esta versão consolida as decisões do outro chat sobre campanhas/newsletter.

## Principais mudanças

1. Cria a base própria `newsletter_contacts`.
2. Campanhas deixam de buscar diretamente na tabela `clients`.
3. Clientes do visto são importados para `newsletter_contacts` pelo SQL, com duplicidade eliminada por `email_normalized`.
4. Se vários clientes têm o mesmo email:
   - cria apenas 1 contato;
   - registra quantidade de clientes vinculados;
   - registra nomes vinculados;
   - escolhe o nome do líder do grupo/processo quando houver;
   - se não houver líder, prioriza a pessoa mais velha.
5. Brevo permanece apenas como serviço de envio, não como fonte de contatos.
6. Cria área `Newsletter / Contatos`.
7. Permite:
   - listar contatos;
   - buscar por nome/email;
   - filtrar por status/origem;
   - adicionar contato manual;
   - editar contato;
   - ativar;
   - descadastrar;
   - bloquear;
   - exportar CSV.
8. Campanhas agora criam lista congelada em `campaign_recipients`.
9. `campaign_recipients` possui proteção contra duplicidade por campanha + email.
10. Campanhas recentes passam a ter:
    - Visualizar;
    - Excluir rascunho, apenas se status = draft.

## Ainda não incluído nesta etapa

- Envio em massa real em lotes.
- Pausar/retomar envio.
- Relatório completo de abertura/clique.
- Importação CSV/Excel com upload.
- Importação Gmail.

Esses itens ficam para as próximas etapas.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v92_newsletter_contatos_independentes.sql`
