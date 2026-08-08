# Projeto completo reconstruído

Inclui:
- painel admin seguro por senha da Vercel;
- link seguro individual;
- CPF + data sempre exigidos ao abrir o link;
- data digitada em DD/MM/AAAA, sem calendário;
- salvamento automático;
- PDF após envio;
- balões de ajuda;
- botão Copiar WhatsApp;
- botão Copiar e-mail HTML para Gmail;
- log de atividade no painel.

## Variáveis Vercel necessárias
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_PASSWORD
- ADMIN_SESSION_SECRET

## Supabase
Rode `supabase-schema-seguro.sql` apenas se quiser recriar o banco do zero.

## Atualização
1. Descompacte o ZIP.
2. Suba todo o conteúdo no GitHub.
3. Commit changes.
4. Vercel > Redeploy sem cache.
