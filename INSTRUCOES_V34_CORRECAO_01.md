# V34 Consolidada — correção 01

## Corrigido

- Imagem de fundo do login substituída por recorte limpo, sem texto/logotipo sobreposto.
- Corrigida trava em `/admin` após login.
- Removida verificação antiga de senha/API no admin que conflitava com Supabase Auth.
- Supabase client agora usa instância única para evitar aviso de múltiplos GoTrueClient.
- Login redireciona de forma direta para `/admin`.

## Testar

1. Abrir aba anônima.
2. Acessar `/`.
3. Fazer login.
4. Confirmar entrada no painel.
5. Clicar em Sair.
6. Testar `/admin/login`.
7. Testar visual do login no celular.

## Supabase

Não precisa rodar SQL novo.
