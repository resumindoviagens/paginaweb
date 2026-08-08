# V111 — Cliente único

## Inclui

1. Novo módulo administrativo:
   - /admin/clientes

2. Novo cadastro único de pessoa:
   - nome completo;
   - nome como consta na reserva;
   - CPF;
   - nascimento;
   - email;
   - telefone;
   - passaporte;
   - emissão;
   - validade;
   - órgão/local;
   - nacionalidade;
   - observações.

3. Integração com viagens:
   - passageiro manual com nome + CPF + nascimento cria/vincula cadastro único;
   - evita duplicidade por CPF + nascimento;
   - mantém vínculo com cliente de viagem.

4. Integração com visto:
   - botão “Criar processo de visto” dentro do módulo Clientes;
   - cria cadastro no módulo principal de vistos com link seguro.

5. Migração:
   - clientes existentes de vistos/passaportes são copiados para `people`;
   - clientes existentes de viagens são copiados para `people`;
   - vínculos são preenchidos quando CPF + nascimento permitem.

## SQL obrigatório

Execute no Supabase:

supabase/migrations/20260511_v111_cliente_unico.sql

## Observação

Esta versão cria a base estrutural do cliente único.
A próxima etapa recomendada é OCR/leitura assistida de passaporte, visto e bilhetes/vouchers usando esse cadastro único como referência.
