# Chatbox Resumindo Viagens — v4.5

Pacote reconstruído sobre o website enviado pelo usuário, preservando integralmente as imagens já corrigidas.

Inclui:
- dez respostas aprovadas no banco inicial;
- triagem condicional e remessa das respostas ao WhatsApp;
- painel `/admin`;
- atendimento humano em tempo real;
- base de respostas editável sem novo deployment;
- sugestões de respostas humanas com aprovação manual;
- relatório por e-mail via Brevo;
- banco Supabase separado do sistema de clientes.

Leia `GUIA-INSTALACAO-DETALHADO.md` antes de publicar.

Correções da v4.5:
- a caixa de resultado da triagem fica realmente oculta até a conclusão;
- o chat não exibe mais o protocolo fictício `RV-00000000`;
- tratamento amigável quando o login anônimo do Supabase estiver desativado;
- botão de nova tentativa e alternativa pelo WhatsApp;
- o botão **Encerrar** sempre fecha e limpa o atendimento local, mesmo quando a sessão falhar;
- sessões já encerradas não deixam o visitante preso ao reabrir o chat;
- interface permanece bloqueada até a sessão segura estar pronta.
