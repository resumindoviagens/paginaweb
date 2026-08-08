export function gerarTokenPesquisa(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function feedbackUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.resumindoviagens.com.br';
  return `${baseUrl}/feedback/${token}`;
}

export const feedbackModelEmailAprovado = (nome: string, link: string) => `
Olá, ${nome}.

Ficamos muito felizes em concluir esta etapa do seu processo.

Quando puder, gostaríamos muito de ouvir sua opinião sobre sua experiência com a Resumindo Viagens.

A pesquisa é rápida, segura e leva menos de 1 minuto:

${link}

Sua resposta nos ajuda a aprimorar nosso atendimento e, caso autorize, poderá ser utilizada parcialmente como depoimento, sem exposição de dados sensíveis.

Atenciosamente,
Resumindo Viagens
`;

export const feedbackModelEmailNegado = (nome: string, link: string) => `
Olá, ${nome}.

Sabemos que o resultado do visto pode gerar frustração.

Ainda assim, gostaríamos de entender como foi sua experiência com nosso atendimento e suporte durante o processo.

A pesquisa é rápida, segura e leva menos de 1 minuto:

${link}

Sua resposta nos ajuda a melhorar continuamente nosso atendimento.

Atenciosamente,
Resumindo Viagens
`;
