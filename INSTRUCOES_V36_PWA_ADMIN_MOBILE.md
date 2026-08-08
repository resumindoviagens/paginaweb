# V36 — PWA completo + Admin mobile

## Incluído

### PWA
- `public/manifest.json`
- ícones 192 e 512
- `public/sw.js`
- `public/offline.html`
- registro automático do service worker
- modo standalone
- suporte para adicionar à tela inicial
- tela offline básica
- splash/ícone via manifest

### Formulário do cliente
- aviso explicando como adicionar à tela inicial
- orientação para famílias:
  - Resumindo - João
  - Resumindo - Maria

### Admin mobile
- painel preservado no desktop
- no celular, a lista vira cards por cliente
- nome do cliente fica em destaque
- status/link/ações organizados em blocos
- botões em largura total
- popups de ações abrem melhor no celular
- alertas ficam destacados dentro do card

## Notificações

Esta versão prepara PWA e service worker, mas NÃO envia push notifications reais ainda.
Notificações reais exigem:
- geração de chaves VAPID;
- permissão individual do usuário;
- API para salvar assinaturas;
- endpoint para disparar push.

Recomendação: fazer notificações em etapa própria depois que o PWA estiver validado.

## Testes

1. Abrir no celular.
2. Safari/Chrome: adicionar à tela inicial.
3. Abrir pelo ícone.
4. Testar formulário.
5. Entrar no admin pelo celular.
6. Ver se clientes aparecem como cards.
7. Clicar nas ações de um cliente.
8. Testar offline rapidamente: abrir uma página, ativar modo avião, recarregar.
