Implementar claramente a experiência de pesquisa de satisfação.

O usuário quer ver:

1. Onde a pesquisa aparece para o cliente:
   - rota /feedback/[token]
   - tela 1: CPF + data de nascimento
   - tela 2: código de 6 dígitos por email
   - tela 3: perguntas da pesquisa
   - tela 4: obrigado/resposta registrada

2. Onde o admin vê as respostas:
   - rota /admin/feedbacks
   - tabela com cliente, nota, tipo, ponto forte, autorização e data
   - botão Ver resposta
   - botão Gerar postagem Instagram, habilitado apenas se autorizou_divulgacao = true

3. Onde o admin gera a postagem:
   - botão “Gerar postagem Instagram”
   - deve criar card quadrado 1080x1080
   - com comentário autorizado
   - sem CPF, sem passaporte, sem visto, sem dados sensíveis
   - com nome público reduzido ou “Cliente Resumindo Viagens”
   - com @resumindoviagens
   - baixar como PNG ou abrir preview para print

4. Manter botões visíveis primeiro.
   Cockpit e agrupamento ficam para etapa futura.

5. A pesquisa deve continuar vinculada ao cliente e protegida por:
   - link individual
   - CPF + nascimento
   - código de 6 dígitos por email
