import test from 'node:test';
import assert from 'node:assert/strict';
import { selectApprovedAnswer } from '../lib/answer-matcher.js';
import { sendSessionReport, shouldNotifyTeam } from '../lib/session-report.js';

const items = [
  {
    id: 'renewal',
    active: true,
    priority: 100,
    question: 'Como funciona a renovação do visto americano?',
    variations: ['Meu visto venceu, vocês fazem renovação?'],
    answer: 'RESPOSTA DE RENOVAÇÃO'
  },
  {
    id: 'chances',
    active: true,
    priority: 100,
    question: 'Quais são minhas chances de ter o visto americano aprovado?',
    variations: ['Gostaria de saber quais são minhas chances de ter o visto americano aprovado?'],
    answer: 'RESPOSTA LITERAL SOBRE CHANCES'
  }
];

test('seleciona a resposta literal exata sobre chances', () => {
  const match = selectApprovedAnswer('Gostaria de saber quais são minhas chances de ter o visto americano aprovado?', items);
  assert.equal(match?.item.id, 'chances');
  assert.equal(match?.item.answer, 'RESPOSTA LITERAL SOBRE CHANCES');
});

test('não confunde pergunta genérica de chances com renovação', () => {
  const match = selectApprovedAnswer('Você acha que meu visto pode ser aprovado?', [items[0]]);
  assert.equal(match, null);
});

test('não escolhe quando duas respostas exatas entram em conflito', () => {
  const ambiguous = [
    { id: 'a', active: true, question: 'Pergunta igual?', variations: [], answer: 'A' },
    { id: 'b', active: true, question: 'Outra', variations: ['Pergunta igual?'], answer: 'B' }
  ];
  assert.equal(selectApprovedAnswer('Pergunta igual?', ambiguous), null);
});

test('não notifica equipe quando não há pergunta nem pedido de WhatsApp', () => {
  assert.equal(shouldNotifyTeam([], 'inatividade por 15 minutos'), false);
  assert.equal(shouldNotifyTeam([{ role: 'assistant', sender_type: 'bot', content: 'Olá' }], 'saída da página'), false);
});

test('notifica quando existe pergunta ou pedido explícito de WhatsApp', () => {
  assert.equal(shouldNotifyTeam([{ role: 'user', sender_type: 'visitor', content: 'Qual é o prazo?' }], 'inatividade por 15 minutos'), true);
  assert.equal(shouldNotifyTeam([], 'continuação pelo WhatsApp'), true);
});


test('relatório encerra sessão sem chamar e-mail quando não há pergunta', async () => {
  const updates = [];
  const db = {
    from(table) {
      assert.equal(table, 'chat_sessions');
      return {
        update(payload) {
          updates.push(payload);
          return { eq: async () => ({ error: null }) };
        }
      };
    }
  };
  const result = await sendSessionReport({
    db,
    session: { id: 'session-without-question', visitor_name: 'Teste' },
    messages: [{ role: 'assistant', sender_type: 'bot', content: 'Olá' }],
    reason: 'inatividade por 15 minutos',
    endedAt: '2026-08-01T12:00:00.000Z'
  });
  assert.equal(result.skipped, true);
  assert.equal(result.emailSent, false);
  assert.equal(updates[0].report_message_id, 'skipped:no-question');
});
