
export const WHATSAPP_URL = "https://wa.me/5511981210932";

export const KNOWLEDGE_BASE = `
IDENTIDADE E POSICIONAMENTO
- A Resumindo Viagens oferece atendimento humano, personalizado, organizado, discreto e criterioso.
- A empresa une assessoria documental, experiência prática em viagens internacionais e suporte antes, durante e depois da viagem.
- Valores centrais: confidencialidade, atendimento próximo, clareza, segurança, excelência operacional e responsabilidade.
- O atendimento não é apresentado como operação em massa. Cada situação pode exigir análise individual.
- Contato de atendimento humano: WhatsApp 11 98121-0932 — https://wa.me/5511981210932.
- E-mail institucional: contato@resumindoviagens.com.br.
- Instagram: @resumindoviagens.

SERVIÇOS DE VISTOS E DOCUMENTOS
1. Visto americano — primeiro visto:
   - Assessoria no preenchimento do formulário DS-160.
   - Organização das informações e orientações sobre o processo.
   - Preparação para entrevista e videochamada de orientação.
   - Atendimento individualizado.
2. Visto americano — renovação:
   - Conferência geral do enquadramento e orientações.
   - Preenchimento do DS-160 e apoio na organização do procedimento.
   - Acompanhamento e atendimento personalizado.
3. Orientação após negativa de visto:
   - Análise individual do histórico informado pelo interessado.
   - Revisão estratégica e orientações para um novo pedido.
   - Não existe promessa ou garantia de aprovação.
4. Visto canadense e eTA Canadá:
   - Apoio para visto canadense tradicional.
   - Apoio para eTA quando a pessoa se enquadra nos requisitos aplicáveis.
   - Os requisitos oficiais podem mudar e devem ser confirmados no atendimento.
5. ESTA:
   - Assessoria no preenchimento da autorização eletrônica para viajantes elegíveis ao Visa Waiver Program.
   - A elegibilidade depende da nacionalidade, do passaporte e das regras oficiais vigentes.
6. Passaporte brasileiro:
   - Orientação sobre documentação, formulário, taxa, agendamento e organização do procedimento.

PRODUTOS E PLANEJAMENTO DE VIAGEM
- Seguro viagem nacional e internacional, com análise do perfil e do destino.
- Passagens aéreas, pesquisa de rotas e alternativas com equilíbrio entre preço e praticidade.
- Hotéis e resorts no Brasil e no exterior.
- Casa em Orlando e suporte para viagem a Orlando.
- Locação de veículos no Brasil e no exterior.
- Planejamento de viagem e roteiros personalizados.
- Destino Europa, com orientação para deslocamentos de trem, carro, avião ou excursões.
- Auxílio para brasileiros e estrangeiros que moram fora e vêm visitar o Brasil, inclusive seguro viagem.
- Atendimento internacional em português, inglês e espanhol, com nível de conversação em francês.
- Apoio prático em contato com hotéis, companhias aéreas e locadoras durante viagens, conforme o serviço contratado.

LIMITES E REGRAS DE RESPOSTA
- A decisão sobre concessão de visto é exclusivamente da autoridade governamental competente.
- Nunca prometer aprovação, prazo garantido, resultado consular ou preço fixo sem confirmação humana.
- Taxas, regras migratórias, prazos, exigências de documentos e condições comerciais podem mudar.
- Para valores, datas, análise de perfil, elegibilidade precisa ou situações particulares, encaminhar ao WhatsApp.
- O assistente público não acessa o sistema app.resumindoviagens.com.br e não possui conexão com cadastros de clientes.
- O assistente não consulta, confirma, revela, altera, cria ou exclui dados de clientes.
- O assistente não informa se determinada pessoa é, foi ou deixou de ser cliente.
- O assistente não consulta andamento, datas, pagamentos, formulários, documentos, agendamentos, resultados, pesquisas ou processos individuais.
- Nunca solicitar CPF, data de nascimento, número de passaporte, número de visto, protocolo, confirmação DS-160, senha ou documentos.
- Quando a dúvida exigir análise individual ou não estiver coberta pela base, responder de forma transparente e indicar https://wa.me/5511981210932.
`;

const RESTRICTED_PATTERNS = [
  /\b(?:é|foi|era|já é|já foi)\s+(?:um\s+|uma\s+)?cliente\b/i,
  /\b(?:cliente|pessoa)\b.{0,50}\b(?:status|andamento|cadastro|dados|processo|agendamento|pagamento|documento)\b/i,
  /\b(?:status|andamento|etapa|situação|resultado)\b.{0,45}\b(?:meu|minha|processo|cadastro|solicitação|pedido|dele|dela)\b/i,
  /\b(?:meu|minha|dele|dela)\b.{0,35}\b(?:processo|cadastro|formulário|ds-160|agendamento|pagamento|documento)\b.{0,45}\b(?:onde|qual|quando|como|está|andamento|etapa|status|resultado|situação)\b/i,
  /(?:fulano|ciclano|beltrano|essa pessoa|meu marido|minha esposa|meu filho|minha filha).{0,30}(?:é|foi|já foi).{0,15}cliente/i,
  /(?:quem|quais|lista).{0,35}clientes/i,
  /(?:confirmar|verificar|consultar|descobrir).{0,30}(?:se .* cliente|cadastro|processo|andamento|status)/i,
  /(?:meu|minha|do cliente|da cliente).{0,20}(?:cadastro|processo|formulário|ds-160|agendamento|pagamento|documento|passaporte|visto).{0,25}(?:status|andamento|situação|data|resultado|está|ficou)/i,
  /(?:alterar|mudar|editar|apagar|excluir|criar|atualizar).{0,30}(?:cadastro|dados|cliente|processo|formulário|agendamento)/i,
  /(?:me passe|me diga|informe|revele|mostre).{0,35}(?:cpf|telefone|e-mail|email|data de nascimento|passaporte|documentos|dados).{0,25}(?:cliente|pessoa)/i,
  /(?:acessar|entrar|abrir).{0,25}(?:app\.resumindoviagens|painel|sistema de clientes|cadastro de clientes)/i
];

export function isRestrictedClientDataRequest(question = "") {
  return RESTRICTED_PATTERNS.some(pattern => pattern.test(question));
}

export function restrictedAnswer() {
  return `Por segurança e confidencialidade, não tenho acesso ao cadastro, ao processo ou aos dados de nenhuma pessoa. Também não posso confirmar quem é cliente, consultar andamento ou alterar informações no sistema. Para atendimento individual, fale diretamente com a Resumindo Viagens: ${WHATSAPP_URL}`;
}

const FAQS = [
  {
    patterns: [/primeiro visto/i, /primeira vez.*visto/i, /tirar.*visto americano/i],
    answer: `A assessoria para o primeiro visto americano pode incluir preenchimento do DS-160, organização das informações, orientações sobre o processo e preparação para entrevista por videochamada. Como cada perfil é diferente, detalhes e valores devem ser confirmados no atendimento: ${WHATSAPP_URL}`
  },
  {
    patterns: [/renova(?:ção|r).*visto/i, /visto.*vencid/i],
    answer: `Na renovação do visto americano, a Resumindo auxilia com o DS-160, organização do procedimento e orientações conforme a situação do solicitante. Os critérios e a necessidade de entrevista podem variar. Para análise individual: ${WHATSAPP_URL}`
  },
  {
    patterns: [/negativa.*visto/i, /visto.*negad/i, /segunda tentativa/i],
    answer: `A Resumindo oferece orientação após negativa, com análise individual das informações, revisão estratégica e preparação para um novo pedido. Não é possível garantir aprovação, pois a decisão é da autoridade consular. Para aprofundar seu caso: ${WHATSAPP_URL}`
  },
  {
    patterns: [/passaporte/i, /emitir.*passaporte/i],
    answer: `A assessoria de passaporte pode abranger orientações sobre documentos, formulário, taxa, agendamento e organização do procedimento. Para confirmar requisitos atuais e receber atendimento: ${WHATSAPP_URL}`
  },
  {
    patterns: [/canad/i, /\beta\b/i],
    answer: `A Resumindo atende solicitações de visto canadense tradicional e eTA, quando o viajante se enquadra nas regras aplicáveis. A elegibilidade depende do perfil, do passaporte e das exigências oficiais vigentes. Para verificar seu caso: ${WHATSAPP_URL}`
  },
  {
    patterns: [/\besta\b/i, /visa waiver/i, /passaporte europeu/i],
    answer: `A Resumindo auxilia no preenchimento do ESTA para viajantes elegíveis ao Visa Waiver Program. A autorização não substitui o visto em situações fora do programa e a elegibilidade precisa ser conferida individualmente: ${WHATSAPP_URL}`
  },
  {
    patterns: [/seguro viagem/i, /seguro.*internacional/i],
    answer: `A Resumindo oferece seguro viagem para diferentes destinos e perfis, inclusive para quem mora fora do Brasil e vem visitar o país. Coberturas e valores dependem das datas, idade, destino e necessidades da viagem. Faça a cotação: ${WHATSAPP_URL}`
  },
  {
    patterns: [/passagem|voo|aérea|aereo/i],
    answer: `A Resumindo pesquisa opções de passagens aéreas considerando rota, tempo de viagem, conexões e custo-benefício. Para uma pesquisa real, informe datas, origem, destino e quantidade de passageiros pelo WhatsApp: ${WHATSAPP_URL}`
  },
  {
    patterns: [/hotel|hospedagem|resort/i],
    answer: `A Resumindo auxilia na escolha e reserva de hotéis e resorts no Brasil e no exterior, considerando localização, conforto, segurança e custo-benefício. Para receber opções: ${WHATSAPP_URL}`
  },
  {
    patterns: [/orlando|disney|parques/i],
    answer: `Para Orlando, a Resumindo pode auxiliar com planejamento, hospedagem, casa, ingressos, passagens, locação de veículo, seguro e orientações gerais. Para montar sua viagem: ${WHATSAPP_URL}`
  },
  {
    patterns: [/carro|veículo|veiculo|locação|locacao/i],
    answer: `A Resumindo trabalha com locação de veículos em destinos nacionais e internacionais, com apoio na escolha do carro e orientações sobre retirada e devolução. Para cotação: ${WHATSAPP_URL}`
  },
  {
    patterns: [/europa|trem|roteiro europeu/i],
    answer: `No serviço Destino Europa, a Resumindo pode apoiar roteiros, logística entre cidades e escolhas de trem, carro, avião ou excursão. O planejamento é personalizado. Para detalhar a viagem: ${WHATSAPP_URL}`
  },
  {
    patterns: [/planejamento|roteiro|organizar.*viagem/i],
    answer: `O planejamento de viagem pode incluir roteiro personalizado, sugestões de destinos, logística, hospedagem, passagens, transporte, seguro e outras soluções conforme o perfil do viajante. Para começar: ${WHATSAPP_URL}`
  },
  {
    patterns: [/moro fora|mora fora|visitar o brasil|viajar para o brasil/i],
    answer: `A Resumindo atende quem mora fora do Brasil e precisa de soluções para visitar o país, como seguro viagem, passagens e hospedagem. Para explicar sua necessidade: ${WHATSAPP_URL}`
  },
  {
    patterns: [/inglês|ingles|espanhol|francês|frances|idioma/i],
    answer: `O atendimento pode ser realizado em português, inglês e espanhol, além de conversação em francês. A Resumindo também pode auxiliar em contatos práticos com fornecedores durante a viagem, conforme o serviço contratado. WhatsApp: ${WHATSAPP_URL}`
  },
  {
    patterns: [/contato|whatsapp|atendente|pessoa|humano/i],
    answer: `Você pode falar diretamente com a Resumindo Viagens pelo WhatsApp: ${WHATSAPP_URL}. O número é 11 98121-0932.`
  }
];

export function findLocalAnswer(question = "") {
  const text = question.trim();
  if (!text) return null;
  for (const faq of FAQS) {
    if (faq.patterns.some(pattern => pattern.test(text))) return faq.answer;
  }
  return null;
}
