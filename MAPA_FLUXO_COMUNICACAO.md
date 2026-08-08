# Mapa visual do fluxo de comunicação — Resumindo Viagens

## 1. Pré-contratação — WhatsApp

Interessado → Triagem inicial → Proposta / valores → Fechamento → Pagamento da assessoria

Mensagens no admin:
- 01 - Triagem inicial
- 02 - Proposta / valores
- 03 - Fechamento / confirmação
- 04 - Pagamento da assessoria

## 2. Pós-pagamento da assessoria — WhatsApp + Email

Pagamento recebido → Coleta de documentos e dados → Cadastro no sistema → Email 01 com link do formulário

Mensagem WhatsApp:
- 05 - Comprovante recebido / coleta de dados

Email:
- 01 - Envio do formulário

## 3. Preenchimento do formulário — Email

Formulário enviado → Se pendente, lembrete → Formulário recebido → Análise e preenchimento oficial DS-160

Emails:
- 02 - Formulário pendente
- 03 - Formulário recebido

## 4. Taxa consular — WhatsApp + Email

DS-160 concluído → WhatsApp pergunta boleto ou Pix → Cliente paga taxa → Email confirma compensação → WhatsApp trata datas

Mensagens WhatsApp:
- 06 - Taxa consular / forma de pagamento
- 06A - Resposta: boleto
- 06B - Resposta: Pix / QR Code

Email:
- 04 - Taxa compensada / próximas datas

## 5. Agendamento — WhatsApp + Email

Cliente escolhe data no WhatsApp → Oferta de entrega do passaporte → Agendamento concluído → Email com documentos e instruções

Mensagens WhatsApp:
- 07 - Oferta entrega do passaporte
- 07A - Cliente aceitou entrega

Email:
- 05 - Agendamento confirmado / instruções

## 6. Preparação para entrevista — Email + WhatsApp

Entrevista se aproximando → Email de preparação → WhatsApp agenda videochamada → Pós-videochamada → Mensagem opcional de boa sorte

Email:
- 06 - Preparação para videochamada

Mensagens WhatsApp:
- 08 - Agendar videochamada
- 08A - Confirmar videochamada
- 09 - Pós-videochamada
- 10 - Boa sorte amanhã

## 7. Resultado e encerramento — Email

Entrevista realizada → Aprovado ou não aprovado → Rastreio → Passaporte recebido → Pós-venda / indicação / Canadá / viagem

Emails:
- 07 - Visto aprovado
- 08 - Visto não aprovado
- 09 - Enviar rastreio
- 10 - Passaporte recebido / encerramento

## Observações de implementação

- Emails automáticos continuam desativados nesta versão.
- O menu de WhatsApp é global e fica fora da individualidade dos clientes.
- Os modelos de email permanecem por cliente, pois usam nome e link individual.
- Todos os emails devem manter logomarca, botão/links clicáveis e trio de contato.

## V11 — novas funções no admin

### Emails automáticos
- O botão **Enviar emails automáticos (Brevo)** voltou ao admin.
- Cada email enviado fica marcado com ✅ no próprio menu do cliente.
- Emails 05 e 06 aparecem como **(não disponível)** para envio automático, pois dependem de anexos/rotina manual.

### Alertas de datas
Campos por cliente:
- Data CASV
- Data da entrevista
- Data da videochamada
- Cidade do consulado

Alertas visuais:
- Vermelho: entrevista muito próxima
- Amarelo: entrevista próxima
- Azul: CASV/videochamada próximos
