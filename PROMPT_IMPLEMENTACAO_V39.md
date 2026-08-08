Implemente a V39 no projeto Next.js/Supabase.

Requisitos obrigatórios:

1. Corrigir erro de coluna ausente:
   - criar coluna clients.data_final_processo via migration.

2. Adicionar etapa:
   - passaporte_devolvido.

3. O botão “Liberar pesquisa” deve ficar sempre visível no Admin do cliente.
   - antes de passaporte_devolvido: visível, cinza/desabilitado;
   - tooltip/texto: “Disponível após marcar Passaporte devolvido.”
   - depois de passaporte_devolvido: ativo/clicável.

4. Ao clicar em “Liberar pesquisa”:
   - gerar token individual;
   - salvar em clients.feedback_token;
   - marcar clients.feedback_liberado = true;
   - gerar validade;
   - registrar log;
   - exibir link copiável.

5. Criar fluxo público:
   /feedback/[token]

6. Segurança nível 2:
   - CPF + data de nascimento;
   - código de 6 dígitos por email;
   - salvar IP, user-agent e horário.

7. Ao responder:
   - salvar na tabela feedbacks;
   - vincular ao client_id;
   - aparecer no Admin em “Feedbacks”.

8. Criar área admin:
   /admin/feedbacks

9. Não automatizar envio para visto negado.
   - liberação manual apenas.

10. Não transformar em CRM complexo.
    - manter estrutura premium enxuta.

11. Manter a experiência visual da Resumindo Viagens:
    - botão visível desde o início;
    - fluxo claro;
    - cliente fictício deve conseguir testar a jornada completa.
