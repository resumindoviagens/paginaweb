# V94 — Pendentes da newsletter e alertas no email diário

## Inclui

1. Newsletter
   - O painel separa `Pendentes revisão` de `Descadastrados reais`.
   - Contatos `pending_review` deixam de aparecer como descadastrados.
   - Novo botão em Newsletter / Contatos:
     `Aprovar pendentes filtrados`.
   - O botão aprova apenas os pendentes dentro do filtro atual de origem/categoria.
   - Ao aprovar, os contatos passam para:
     - status = active
     - aceita_newsletter = true

2. Email diário de alertas
   - O email diário agora respeita os alertas baixados no painel.
   - Alertas já baixados em `admin_alert_dismissals` não entram mais no email diário.
   - As chaves de alerta foram alinhadas com o painel Admin.

## SQL

Não precisa executar SQL novo.
