# V84 — Condicionais avançadas do formulário

## Página 2
- Se 2.12 = "O próprio solicitante", bloqueia 2.13 a 2.18.
- Se 2.19 = "Não", bloqueia 2.20 em diante.
- A antiga 2.20 segue desmembrada em até 5 acompanhantes.

## Página 3
- Se 3.1 = "Não", bloqueia 3.2 a 3.13.
- Se 3.14 = "Não", bloqueia 3.15 a 3.19.

## Página 4
- Se 4.17 = "Não", bloqueia 4.18 a 4.33.

## Página 5
- Se 5.8 = "Não", bloqueia 5.9.

## Página 7
- 7.2 teve o enunciado ajustado.
- Salário bruto agora possui opção "Não se aplica".
- Se "Não se aplica" estiver marcado, o campo salário fica bloqueado.
- 7.8 = "Não" bloqueia 7.9.
- 7.10 vem como "Não" por padrão.
- Se 7.10 = "Não", bloqueia os campos seguintes da página 7.
- Se 7.10 = "Sim", libera formação e pergunta sobre outros cursos.
- Nova pergunta: "Possui outros cursos de graduação, ou ainda cursos de Pós-graduação, Mestrado ou Doutorado JÁ CONCLUÍDO?"
- Essa nova pergunta vem como "Não" por padrão.
- Se permanecer "Não", bloqueia o campo seguinte.
- Se virar "Sim", libera o campo "Informe instituição, endereço, data de início e conclusão".

## Página 8
- 8.2 libera apenas se 8.1 = Sim.
- 8.5 libera apenas se 8.4 = Sim.
- 8.7 libera apenas se 8.6 = Sim.
- 8.9 libera apenas se 8.8 = Sim.
- 8.10 teve o enunciado alterado.
- 8.11 libera apenas se 8.10 = Sim.

## Página 9
- Todas as perguntas 9.1 a 9.20 ficam destacadas em amarelo.
- Não permite avançar para a página 10 sem responder todas 9.1 a 9.20.
- 9.21 libera apenas se alguma resposta 9.1 a 9.20 for "Sim".
- Alerta no Admin se qualquer resposta da página 9 for "Sim".

## Página 10
- Alerta no Admin se 10.1 for preenchida.

## Regra geral
- Campo bloqueado conta como respondido no progresso.
- Campo bloqueado fica cinza e com aviso visual.

## SQL
Não precisa executar SQL novo.
