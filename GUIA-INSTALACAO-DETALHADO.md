# Guia de instalação — Painel e Chatbox v4.1

## 1. O que foi preservado
Este pacote usa o seu `paginaweb-main.zip` como base. A pasta `assets` foi copiada sem substituir, recomprimir ou renomear imagens. Consulte `RELATORIO-IMAGENS-PRESERVADAS.txt`.

## 2. Faça backup
No GitHub, abra o repositório do website, clique em **Code → Download ZIP** e guarde o arquivo. Não altere o projeto do aplicativo privado.

## 3. Crie um Supabase exclusivo
No Supabase, clique em **New project** e use um nome como `resumindo-chatbox`. Não use o banco que contém clientes. Guarde a senha do banco.

## 4. Ative os logins
Em **Authentication → Sign In / Providers**, mantenha **Email** habilitado e ative **Anonymous Sign-Ins**.

## 5. Crie o administrador
Em **Authentication → Users → Add user**, crie `contato@resumindoviagens.com.br`, defina uma senha exclusiva e confirme o usuário.

## 6. Execute o SQL
Abra **SQL Editor → New query**, cole todo o conteúdo de `supabase/setup.sql` e clique em **Run**. O resultado final deve mostrar 10 respostas, 10 perguntas de triagem e 1 administrador. Se administradores aparecer como 0, crie o usuário e rode o SQL novamente.

## 7. Copie as chaves do Supabase
Em **Project Settings → API**, copie:
- Project URL;
- Publishable key (`sb_publishable_...`) ou `anon`;
- Secret key (`sb_secret_...`) ou `service_role`.
Nunca coloque a chave secreta no GitHub ou em capturas de tela.

## 8. Variáveis na Vercel
No projeto do website, abra **Settings → Environment Variables** e mantenha:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` = `gpt-5-mini`
- `BREVO_API_KEY`

Adicione:
- `SUPABASE_URL` = Project URL
- `SUPABASE_PUBLISHABLE_KEY` = Publishable/anon key
- `SUPABASE_SECRET_KEY` = Secret/service_role key
- `CRON_SECRET` = senha aleatória longa

Marque Production e Preview. Não use aspas e não escreva `NOME=valor`.

## 9. Publique no GitHub
Extraia este ZIP e envie o conteúdo interno para a raiz do repositório. As pastas `assets`, `admin`, `api`, `lib` e `supabase` precisam ficar na raiz, junto de `index.html`. Faça o commit.

## 10. Deployment
Na Vercel, abra **Deployments** e aguarde o novo deployment ficar **Ready**. Alterações de variáveis só funcionam em deployments novos.

## 11. Testes
Abra `/api/health`. A versão esperada é `painel-chat-v4.1-imagens-preservadas` e todos os campos de configuração devem estar `true`.

Abra `/admin` e entre com o usuário criado no Supabase. Em outra janela anônima, abra o site, fale no chatbot, faça a triagem e teste **Falar com atendente aqui**.

## 12. Imagens
Não substitua a pasta `assets` por imagens de pacotes anteriores. Esta versão já contém as imagens exatas do ZIP enviado.
