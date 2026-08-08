# V58 — Correções da V57

## Correções incluídas

1. **WhatsApp pesquisa**
   - agora aparece dentro do painel do botão WhatsApp;
   - gera/libera token de pesquisa antes de abrir o WhatsApp;
   - fica bloqueado até marcar `Visto/passaporte devolvido`.

2. **Gerar modelo de email 11**
   - o modelo de pesquisa agora abre por `/email-feedback/[id]`;
   - não depende mais do access_token do formulário;
   - resolve o erro de `Link inválido` em cadastros de controle.

3. **Cadastro de controle**
   - `Gerar PDF`, `PDF para preencher à mão` e `Instruções Foto` ficam desabilitados.

4. **Validade do visto**
   - campo em `Editar dados`;
   - habilita apenas com `Visto aprovado` + `Visto/passaporte devolvido`;
   - alerta se faltar a data.

5. **Exclusão de cadastro**
   - remove a dupla confirmação por senha;
   - agora pede apenas digitar `EXCLUIR`.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v58_correcoes_feedback_pdf_exclusao.sql`
