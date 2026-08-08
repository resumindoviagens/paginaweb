# V51 — Implementações imediatas no Admin

## Inclui

1. Card de famílias/grupos com sombreamento por cor:
   - cada grupo recebe uma cor suave;
   - todos do mesmo grupo ficam com a mesma cor.

2. Cadastro de controle:
   - se `Cadastro de controle — não enviar formulário` estiver marcado, não gera link;
   - se depois desmarcar esse campo e não houver link, o sistema gera um token automaticamente.

3. Novas etapas:
   - Pesquisa de satisfação enviada;
   - Pesquisa de satisfação postada;
   - Pronto para arquivar.

4. Pronto para arquivar:
   - ao marcar esta etapa, o cadastro passa para Processos concluídos;
   - o botão Marcar concluído permanece para uso manual/forçado.

5. WhatsApp da pesquisa:
   - botão `Pesquisa WhatsApp`;
   - fica disponível apenas após `Visto/passaporte devolvido`;
   - copia mensagem pronta para WhatsApp.

6. Pesquisa de satisfação:
   - pergunta opcional para usuário do Instagram;
   - prévia visual simples de como a postagem poderá ficar.

7. Renovação:
   - desabilita Consulado, Entrevista e Videochamada em Processos, datas e rastreios;
   - mantém CASV editável.

8. Passaporte:
   - adiciona campo de validade do passaporte;
   - alerta em todos os clientes sem validade preenchida.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v51_implementacoes_imediatas_admin.sql`

## Observações

- A data final do processo não fica manual.
- Ela é definida automaticamente quando marcar passaporte/visto devolvido, visto negado ou pronto para arquivar.
