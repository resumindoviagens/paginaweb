# V74 — Etapa 1 das novas melhorias

## Base

Gerado sobre o ZIP atual enviado como base funcional do GitHub.

## Inclui

1. Novo botão `Email`
   - fica junto aos botões do cliente no Admin;
   - abre um editor interno;
   - permite escolher o modelo;
   - permite revisar o assunto;
   - permite editar o HTML antes do envio;
   - mostra pré-visualização;
   - envia pelo próprio sistema/Brevo;
   - mantém os botões antigos por segurança.

2. WhatsApp para avaliação
   - botão `Convite avaliação WhatsApp`;
   - gera/libera o link da pesquisa;
   - abre WhatsApp com mensagem pronta.

3. Agenda de pesquisas
   - novo botão `Agenda pesquisas`;
   - lista pesquisas enviadas, respondidas, pendentes e postadas;
   - permite reenviar lembrete por WhatsApp;
   - permite reenviar lembrete por email;
   - permite marcar feedback como postado.

4. Feedbacks
   - página de feedbacks permite baixar/marcar como postado;
   - feedback postado sai da lista principal, com opção de visualizar postados.

5. Alertas
   - botão para baixar todos os alertas atualmente exibidos;
   - usa a tabela de baixas já criada/garantida.

6. Agenda por email
   - ao cadastrar/alterar videochamada ou entrevista, o sistema tenta enviar alerta por email para contato@resumindoviagens.com.br.
   - o envio é best-effort: se falhar, não impede salvar o cliente.

## Observação importante

O editor de email usa HTML editável. Não é um editor visual idêntico ao Gmail ainda, mas já permite revisar, alterar, apagar trechos e enviar pelo sistema.

## SQL obrigatório

Execute no Supabase:

`supabase/migrations/20260510_v74_etapa1_email_feedback_alertas.sql`
