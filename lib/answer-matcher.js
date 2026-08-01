const STRONG_MATCH_SCORE = 0.94;
const MIN_MATCH_MARGIN = 0.12;

function cleanText(value, max = 1800) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function normalize(value) {
  return cleanText(value, 5000)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set("a o os as de da do das dos e em no na nos nas um uma para por com que qual quais como meu minha meus minhas seu seus sua suas voce voces eu ele ela isso este esta ao ou ja mais muito sobre se tem ter foi ser sao gostaria saber".split(" "));

function tokens(value) {
  return normalize(value).split(" ").filter(token => token.length > 2 && !STOP.has(token));
}

function tokenF1(left, right) {
  const leftTokens = new Set(tokens(left));
  const rightTokens = new Set(tokens(right));
  if (!leftTokens.size || !rightTokens.size) return 0;
  const common = [...leftTokens].filter(token => rightTokens.has(token)).length;
  if (!common) return 0;
  const precision = common / leftTokens.size;
  const recall = common / rightTokens.size;
  return (2 * precision * recall) / (precision + recall);
}

function sourceScore(question, source) {
  const q = normalize(question);
  const s = normalize(source);
  if (!q || !s) return { score: 0, exact: false };
  if (q === s) return { score: 1, exact: true };

  const qTokenSet = new Set(tokens(q));
  const sTokenSet = new Set(tokens(s));
  const common = [...qTokenSet].filter(token => sTokenSet.has(token)).length;
  const allShorterTokensCovered = common === Math.min(qTokenSet.size, sTokenSet.size);

  if ((q.includes(s) || s.includes(q)) && allShorterTokensCovered && common >= 3) {
    return { score: 0.97, exact: false };
  }

  return { score: tokenF1(q, s), exact: false };
}

function itemMatch(question, item) {
  const sources = [item.question, ...(Array.isArray(item.variations) ? item.variations : [])].filter(Boolean);
  let best = { score: 0, exact: false, matchedText: "" };
  for (const source of sources) {
    const result = sourceScore(question, source);
    if (result.score > best.score) best = { ...result, matchedText: source };
  }
  return best;
}

function isExpired(item, now = new Date()) {
  if (!item?.valid_until) return false;
  const end = new Date(`${item.valid_until}T23:59:59.999Z`);
  return Number.isFinite(end.getTime()) && end.getTime() < now.getTime();
}

/**
 * Seleciona uma resposta aprovada sem redigir, combinar ou completar conteúdo.
 * Retorna null quando a correspondência não é inequívoca.
 */
export function selectApprovedAnswer(question, items, now = new Date()) {
  const ranked = (items || [])
    .filter(item => item?.active !== false && cleanText(item?.answer) && !isExpired(item, now))
    .map(item => ({ item, ...itemMatch(question, item) }))
    .filter(match => match.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return Number(right.item.priority || 0) - Number(left.item.priority || 0);
    });

  if (!ranked.length) return null;
  const best = ranked[0];
  const second = ranked[1];
  const sameAnswer = Boolean(second && cleanText(second.item.answer) === cleanText(best.item.answer));

  if (best.exact) {
    if (second?.exact && !sameAnswer) return null;
    return best;
  }

  const margin = best.score - Number(second?.score || 0);
  if (best.score >= STRONG_MATCH_SCORE && (margin >= MIN_MATCH_MARGIN || sameAnswer || !second)) {
    return best;
  }
  return null;
}
