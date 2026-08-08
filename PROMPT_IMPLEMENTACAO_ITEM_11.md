Implementar agora o item 11 nos dois modais existentes:

1. No modal “Gerar modelos de email (copiar)”, adicionar:
   11 - Enviar pesquisa de satisfação

2. No modal “Enviar emails automáticos”, adicionar:
   11 - Enviar pesquisa de satisfação

3. O item 11 deve aparecer sempre, mesmo antes de estar habilitado.

4. Antes do cliente estar com “10 - Passaporte recebido / encerramento” marcado:
   - item 11 aparece cinza/desabilitado;
   - texto de apoio: “Disponível após marcar 10 - Passaporte recebido / encerramento.”

5. Após marcar “10 - Passaporte recebido / encerramento”:
   - item 11 fica ativo;
   - ao clicar, chama POST /api/feedback/liberar;
   - gera token individual;
   - salva em clients.feedback_token;
   - marca clients.feedback_liberado = true;
   - exibe/copiar link /feedback/[token].

6. A página do cliente será:
   /feedback/[token]

7. O admin deve ver respostas em:
   /admin/feedbacks

8. Criar alerta no card do cliente quando houver feedback:
   “Avaliação recebida: nota X/10”

9. Na área /admin/feedbacks, criar botão:
   “Gerar postagem Instagram”
   - ativo somente se autorizou_divulgacao = true.
   - gera card quadrado 1080x1080 sem dados sensíveis.

10. Não criar cockpit agora. O objetivo é ver os botões e testar o fluxo.
