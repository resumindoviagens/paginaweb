'use client';

import { useState } from 'react';

const pontos = [
  'organização do processo',
  'formulário inteligente',
  'orientações para entrevista',
  'videochamada individual',
  'suporte e atendimento',
  'agilidade',
  'outro',
];

export default function FeedbackPesquisaCliente() {
  const [step, setStep] = useState<'auth' | 'form' | 'done'>('auth');

  return (
    <main className="mx-auto max-w-2xl p-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Pesquisa de satisfação</h1>
        <p className="mt-2 text-gray-600">
          Sua opinião ajuda a aprimorar nosso atendimento. A pesquisa leva menos de 1 minuto.
        </p>

        {step === 'auth' && (
          <div className="mt-6 grid gap-3">
            <input className="rounded-xl border p-3" placeholder="CPF" />
            <input className="rounded-xl border p-3" placeholder="Data de nascimento" />
            <button className="rounded-xl bg-blue-900 p-3 text-white" onClick={() => setStep('form')}>
              Acessar pesquisa
            </button>
          </div>
        )}

        {step === 'form' && (
          <div className="mt-6 grid gap-4">
            <label className="font-semibold">De 0 a 10, quanto você indicaria a Resumindo Viagens?</label>
            <select className="rounded-xl border p-3">
              {Array.from({ length: 11 }).map((_, i) => <option key={i}>{i}</option>)}
            </select>

            <label className="font-semibold">Qual parte do processo mais lhe ajudou?</label>
            <select className="rounded-xl border p-3">
              {pontos.map((p) => <option key={p}>{p}</option>)}
            </select>

            <label className="font-semibold">Deseja deixar um comentário?</label>
            <textarea className="min-h-32 rounded-xl border p-3" />

            <label className="flex gap-2 text-sm">
              <input type="checkbox" />
              Autorizo a utilização parcial do meu depoimento sem exposição de dados sensíveis.
            </label>

            <button className="rounded-xl bg-blue-900 p-3 text-white" onClick={() => setStep('done')}>
              Enviar avaliação
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="mt-6 rounded-xl bg-green-50 p-4">
            <h2 className="font-semibold">Obrigado pela sua avaliação.</h2>
            <p className="text-sm text-gray-600">Sua resposta foi registrada.</p>
          </div>
        )}
      </section>
    </main>
  );
}
