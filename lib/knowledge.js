export const WHATSAPP_URL = "https://wa.me/5511981210932";

export const KNOWLEDGE_BASE = `
IDENTIDADE E POSICIONAMENTO
- A Resumindo Viagens presta assessoria personalizada para vistos, passaportes e organização de viagens.
- O atendimento é humano, próximo, organizado, discreto e criterioso.
- A empresa combina assessoria documental com experiência prática em viagens internacionais.
- Valores centrais: confidencialidade, clareza, segurança, responsabilidade, excelência operacional e atendimento individualizado.
- Contato institucional: contato@resumindoviagens.com.br.
- Instagram: @resumindoviagens.
- WhatsApp: 11 98121-0932.

COMO FUNCIONA A ASSESSORIA DE VISTO AMERICANO
- Primeiro visto: levantamento e organização das informações, preenchimento do DS-160, orientações sobre o processo, preparação para entrevista e videochamada de orientação.
- Renovação: análise geral do enquadramento, preenchimento do DS-160, organização do procedimento e orientações conforme a situação do solicitante.
- Após negativa: análise individual do histórico informado, revisão estratégica das respostas e preparação para um novo pedido.
- A Resumindo Viagens não promete aprovação. A decisão é exclusivamente da autoridade consular.
- A preparação busca deixar o solicitante mais organizado, seguro e coerente para a entrevista, sem criar informações ou respostas falsas.

DS-160 E ENTREVISTA
- O DS-160 é o formulário eletrônico usado no pedido de visto americano de não imigrante.
- As informações devem ser verdadeiras, completas e coerentes com a realidade do solicitante.
- A assessoria auxilia na organização e no preenchimento das informações fornecidas pelo próprio solicitante.
- A preparação para entrevista pode incluir revisão do perfil, explicação do procedimento e simulação de perguntas.
- O assistente público não coleta documentos nem dados pessoais.

VISTO CANADENSE E ETA
- A empresa auxilia no visto canadense tradicional e na eTA, conforme o enquadramento aplicável.
- A eTA é uma autorização eletrônica de viagem destinada a viajantes elegíveis que chegam ao Canadá por via aérea.
- Elegibilidade e regras oficiais podem mudar e precisam ser confirmadas conforme nacionalidade, passaporte e situação do viajante.

ESTA
- A Resumindo auxilia no preenchimento do ESTA para viajantes elegíveis ao Visa Waiver Program.
- O ESTA não é um visto e não atende todas as situações de viagem.
- A elegibilidade depende da nacionalidade, do passaporte e das regras oficiais vigentes.

PASSAPORTE BRASILEIRO
- A assessoria pode abranger orientação sobre documentação, formulário, taxa, agendamento e organização do procedimento.
- A emissão é realizada pela Polícia Federal, e os prazos dependem do atendimento oficial.

SEGURO VIAGEM
- A Resumindo oferece seguro viagem nacional e internacional.
- A escolha do plano depende do destino, duração, idade dos viajantes e coberturas desejadas.
- Pode haver cobertura para assistência médica, hospitalar, bagagem e outros eventos, conforme a apólice contratada.
- As coberturas exatas devem ser conferidas na proposta e nas condições gerais do seguro.

PASSAGENS AÉREAS
- A empresa pesquisa rotas e alternativas considerando preço, duração total, número de conexões, horários e praticidade.
- Para uma cotação real são necessários origem, destino, datas e quantidade de passageiros.
- Tarifas e disponibilidade mudam constantemente.

HOTÉIS, RESORTS E CASA EM ORLANDO
- A Resumindo auxilia na escolha e reserva de hospedagens no Brasil e no exterior.
- A análise pode considerar localização, segurança, conforto, perfil dos viajantes e custo-benefício.
- Para Orlando, também pode auxiliar com casas, hotéis, parques, ingressos, transporte, seguro e planejamento.

LOCAÇÃO DE VEÍCULOS
- A empresa trabalha com locação de veículos em destinos nacionais e internacionais.
- Pode auxiliar na escolha do veículo e orientar sobre retirada, devolução e condições gerais da locadora.
- Valores e disponibilidade dependem do local e das datas.

PLANEJAMENTO DE VIAGEM E EUROPA
- O planejamento pode incluir roteiro, ordem das cidades, hospedagem, passagens, trem, carro, excursões e seguro.
- O serviço é personalizado conforme perfil, tempo disponível, interesses e orçamento.
- A empresa possui experiência prática em mais de 40 países.

ATENDIMENTO INTERNACIONAL
- Atendimento em português, inglês e espanhol, com nível de conversação em francês.
- Pode haver apoio prático em contatos com hotéis, companhias aéreas e locadoras, conforme o serviço contratado.
- A empresa também atende quem mora fora do Brasil e precisa de soluções para visitar o país.

POLÍTICA DA ORIENTAÇÃO INICIAL
- Responder integralmente dúvidas gerais cobertas por esta base.
- Não mencionar o WhatsApp por padrão e não terminar toda resposta com oferta comercial.
- Quando a pergunta estiver incompleta, fazer uma pergunta curta de esclarecimento.
- Só encaminhar ao WhatsApp quando houver cotação, preço, disponibilidade, análise individual, elegibilidade exata, regra oficial variável, pedido de execução de serviço ou solicitação de atendimento humano.
- Quando encaminhar, primeiro explicar tudo o que for possível e somente depois apresentar o link.
- Não inventar preços, prazos, requisitos, disponibilidade ou garantias.
- Não dar aconselhamento jurídico, migratório ou médico definitivo.

PRIVACIDADE — REGRA ABSOLUTA
- A orientação pública não acessa o app.resumindoviagens.com.br, Gmail, bancos de dados de clientes, cadastros ou arquivos privados.
- Não confirma nem nega se determinada pessoa é, foi ou deixou de ser cliente.
- Não consulta andamento, status, pagamentos, agendamentos, documentos, formulários ou resultados individuais.
- Não cria, altera ou exclui dados de clientes.
- Não solicita CPF, data de nascimento, número de passaporte, número de visto, protocolo, senha, DS-160 ou documentos.
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
  return `Por segurança e confidencialidade, não tenho acesso ao cadastro, ao processo ou aos dados de nenhuma pessoa. Também não posso confirmar quem é cliente, consultar andamento ou alterar informações. Para tratar do seu próprio atendimento com a equipe autorizada, acesse ${WHATSAPP_URL}`;
}

/*
 * As respostas locais foram mantidas somente para perguntas muito frequentes e
 * completas. Elas não encaminham ao WhatsApp por padrão.
 */
const FAQS = [
  {
    patterns: [
      /^como funciona a assessoria para o primeiro visto americano\??$/i,
      /^como funciona o primeiro visto americano\??$/i
    ],
    answer: `A assessoria para o primeiro visto americano começa com a organização das informações do solicitante. A Resumindo auxilia no preenchimento do DS-160, orienta sobre o procedimento e ajuda a identificar pontos que precisam estar claros e coerentes.

Antes da entrevista, pode ser realizada uma videochamada de preparação para explicar a dinâmica do atendimento consular e revisar possíveis perguntas. Todas as respostas devem ser verdadeiras e compatíveis com a realidade do solicitante.

A assessoria melhora a organização e a preparação, mas não garante aprovação, pois a decisão pertence exclusivamente à autoridade consular.`
  },
  {
    patterns: [
      /^como funciona a renovação do visto americano\??$/i,
      /^qual a diferença entre primeiro visto e renovação\??$/i
    ],
    answer: `No primeiro visto, normalmente existe uma preparação mais ampla porque o solicitante ainda não passou pelo procedimento. Na renovação, a Resumindo verifica o histórico do visto anterior, organiza o novo DS-160 e orienta sobre o processo aplicável.

A renovação não significa aprovação automática e, dependendo das regras vigentes e do perfil, pode haver necessidade de entrevista.`
  },
  {
    patterns: [/^o que é (o )?ds-160\??$/i, /^para que serve (o )?ds-160\??$/i],
    answer: `O DS-160 é o formulário eletrônico utilizado em pedidos de visto americano de não imigrante. Ele reúne informações pessoais, profissionais, familiares e sobre a viagem.

O preenchimento deve ser verdadeiro, completo e coerente. A Resumindo organiza e preenche o formulário a partir das informações fornecidas pelo próprio solicitante, além de orientar sobre pontos que precisam de atenção.`
  },
  {
    patterns: [/^quais serviços (vocês|a resumindo) oferecem\??$/i, /^o que a resumindo viagens faz\??$/i],
    answer: `A Resumindo Viagens oferece assessoria para primeiro visto americano, renovação, orientação após negativa, visto canadense, eTA, ESTA e passaporte brasileiro.

Também trabalha com seguro viagem, passagens aéreas, hotéis e resorts, casa e planejamento para Orlando, locação de veículos, roteiros personalizados, Destino Europa e apoio para quem mora fora do Brasil e vem visitar o país.`
  },
  {
    patterns: [/^como funciona (o )?seguro viagem\??$/i],
    answer: `O seguro viagem oferece assistência para eventos previstos na apólice, como despesas médicas e hospitalares, problemas com bagagem e outras ocorrências, conforme o plano contratado.

A escolha depende do destino, duração da viagem, idade dos viajantes e coberturas desejadas. Antes da contratação, é importante conferir os limites, exclusões e condições gerais do seguro.`
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
