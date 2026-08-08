# V78 — Botão Email obedecendo regras de etapa

## Ajuste

O novo botão `Email` agora respeita as mesmas regras operacionais dos botões antigos.

## Regras aplicadas

1. Cadastro de controle
   - não permite modelos iniciais de formulário:
     - 01 Envio do formulário;
     - 02 Formulário pendente;
     - 03 Formulário recebido.

2. Pesquisa de satisfação
   - só fica disponível após:
     - passaporte devolvido; ou
     - processo concluído; ou
     - pronto para arquivar.

3. Encerramento/rastreio
   - modelos de rastreio/passaporte recebido só aparecem quando houver:
     - rastreio; ou
     - passaporte devolvido; ou
     - processo concluído.

4. Segurança também no servidor
   - mesmo se alguém tentar chamar a rota manualmente, a API bloqueia modelo incompatível.

## SQL

Não precisa executar SQL novo.
