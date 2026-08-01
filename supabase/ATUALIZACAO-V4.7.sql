-- =============================================================
-- RESUMINDO VIAGENS — ATUALIZAÇÃO V4.7
-- Respostas exclusivamente literais + bloqueio de e-mails sem pergunta
-- Execute no SQL Editor do mesmo projeto Supabase usado pelo site.
-- Este script é idempotente.
-- =============================================================

insert into public.chat_settings(key,value,updated_at)
values (
  'no_answer_message',
  '"Ainda não tenho uma orientação aprovada e segura para responder a essa dúvida por aqui. Como a resposta pode depender de uma análise individual, a equipe da Resumindo Viagens poderá orientar você pessoalmente. Use a opção “Aprofundar pelo WhatsApp” e não envie documentos ou dados pessoais nesta área."'::jsonb,
  now()
)
on conflict(key) do nothing;

do $$
declare
  v_question text := 'Quais são minhas chances de ter o visto americano aprovado?';
  v_answer text := 'Não é possível estimar de forma responsável as chances de aprovação com base apenas em uma pergunta geral. A decisão é exclusiva da autoridade consular e depende da análise conjunta do perfil do solicitante, das informações declaradas no DS-160, do propósito da viagem e da entrevista consular. A Resumindo Viagens pode analisar esses elementos individualmente, identificar pontos que mereçam atenção e preparar o solicitante para apresentar informações verdadeiras, claras e coerentes. Essa análise e preparação não representam garantia de aprovação. Para uma avaliação personalizada, aprofunde o atendimento com a equipe e não envie documentos ou dados pessoais por esta área.';
begin
  if exists (select 1 from public.knowledge_items where lower(question)=lower(v_question)) then
    update public.knowledge_items
       set category='Visto americano',
           variations=array[
             'Gostaria de saber quais são minhas chances de ter o visto americano aprovado?',
             'Tenho chances de conseguir o visto americano?',
             'Qual é a probabilidade de meu visto ser aprovado?',
             'Vocês conseguem avaliar minhas chances de aprovação?',
             'Meu perfil tem chance de aprovação?',
             'É possível saber se meu visto será aprovado?',
             'Qual a chance de eu conseguir o visto?',
             'Vocês conseguem analisar se meu visto tem chance?'
           ],
           answer=v_answer,
           keywords=array['chances de aprovação','probabilidade de aprovação','perfil do solicitante','aprovação do visto','DS-160','entrevista consular','análise individual'],
           response_mode='direct',
           whatsapp_on=false,
           priority=100,
           active=true,
           requires_review=false,
           valid_until=null,
           updated_at=now()
     where lower(question)=lower(v_question);
  else
    insert into public.knowledge_items(
      category,question,variations,answer,keywords,response_mode,whatsapp_on,priority,active,requires_review
    ) values (
      'Visto americano',
      v_question,
      array[
        'Gostaria de saber quais são minhas chances de ter o visto americano aprovado?',
        'Tenho chances de conseguir o visto americano?',
        'Qual é a probabilidade de meu visto ser aprovado?',
        'Vocês conseguem avaliar minhas chances de aprovação?',
        'Meu perfil tem chance de aprovação?',
        'É possível saber se meu visto será aprovado?',
        'Qual a chance de eu conseguir o visto?',
        'Vocês conseguem analisar se meu visto tem chance?'
      ],
      v_answer,
      array['chances de aprovação','probabilidade de aprovação','perfil do solicitante','aprovação do visto','DS-160','entrevista consular','análise individual'],
      'direct',false,100,true,false
    );
  end if;
end $$;

select
  'ATUALIZAÇÃO V4.7 CONCLUÍDA' as resultado,
  exists(select 1 from public.chat_settings where key='no_answer_message') as mensagem_de_seguranca_criada,
  exists(select 1 from public.knowledge_items where lower(question)=lower('Quais são minhas chances de ter o visto americano aprovado?')) as resposta_de_chances_criada;
