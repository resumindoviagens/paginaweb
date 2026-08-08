# V95 — Serviço de Passaporte + Feedback por serviço

## Inclui

1. Permissão para múltiplos processos com mesmo CPF e data de nascimento.
   - Ex.: cliente faz Passaporte agora e Visto depois.
   - Mantém processos separados, sem apagar histórico.

2. Fluxo próprio para Tipo de Processo = Passaporte.
   Etapas:
   - Documentos solicitados
   - Cadastro realizado
   - Taxa/GRU paga
   - Atendimento PF agendado
   - Instruções enviadas
   - Comparecimento à PF
   - Passaporte disponível
   - Passaporte retirado
   - Pesquisa enviada
   - Pesquisa respondida
   - Pesquisa postada
   - Pronto para arquivar

3. Campos próprios no painel Processo, datas e rastreios:
   - Cidade da Polícia Federal
   - Local/unidade da Polícia Federal
   - Data e hora do atendimento
   - Data de pagamento da GRU

4. Modelos de email do Passaporte:
   - Solicitar documentos
   - Cadastro realizado / taxa paga
   - Atendimento PF agendado
   - Instruções PF
   - Pós-atendimento PF
   - Passaporte disponível
   - Pesquisa de satisfação de passaporte

5. O email de instruções de passaporte anexa:
   - public/docs/instrucoes-passaporte.docx

6. Feedback por serviço:
   - visto
   - passaporte
   - canadense

7. Pesquisa de satisfação passa a exibir texto conforme serviço:
   - assessoria para visto
   - assessoria para passaporte
   - assessoria para visto canadense

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260510_v95_servico_passaporte.sql
