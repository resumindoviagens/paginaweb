# V97C — Correção do botão Email em cliente Passaporte

Corrige a abertura da janela de emails para clientes do tipo Passaporte.

Problema corrigido:
- O cliente Passaporte é cadastro de controle e sem formulário.
- A interface estava tentando abrir os modelos iniciais de formulário ou confundindo P01/P02/P03 com Email 01/02/03.
- Agora o botão Email ignora os emails de formulário e abre diretamente os modelos P01–P07 do Passaporte.

SQL:
- Não há SQL novo.
- Se ainda não executou, execute apenas:
  supabase/migrations/20260510_v97_consolidada_passaporte_sem_anexo.sql
