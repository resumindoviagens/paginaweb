'use client';

import { CHECKLIST_POS_AGENDAMENTO_LABELS } from '@/constants/clientStatus';

type Props = {
  etapaAtual?: string | null;
  feedbackLink?: string | null;
  onLiberarPesquisa?: () => void;
};

export default function PosAgendamentoPanel({ etapaAtual, feedbackLink, onLiberarPesquisa }: Props) {
  const podeLiberarPesquisa = etapaAtual === 'passaporte_devolvido';

  return (
    <section className="rounded-2xl border p-4 shadow-sm">
      <h2 className="text-xl font-semibold">Preparação para Entrevista</h2>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <button className="rounded-xl border px-4 py-2 text-left">Abrir página do vídeo</button>
        <button className="rounded-xl border px-4 py-2 text-left">Gerar email preparação</button>
        <button className="rounded-xl border px-4 py-2 text-left">Marcar vídeo enviado</button>
        <button className="rounded-xl border px-4 py-2 text-left">Registrar videochamada</button>

        <button
          className={`rounded-xl border px-4 py-2 text-left ${
            podeLiberarPesquisa ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          }`}
          disabled={!podeLiberarPesquisa}
          title={!podeLiberarPesquisa ? 'Disponível após marcar Passaporte devolvido.' : 'Liberar pesquisa'}
          onClick={onLiberarPesquisa}
        >
          Liberar pesquisa
        </button>
      </div>

      {!podeLiberarPesquisa && (
        <p className="mt-2 text-sm text-gray-500">
          A pesquisa ficará clicável após marcar <strong>Passaporte devolvido</strong>.
        </p>
      )}

      {feedbackLink && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <p className="text-sm font-medium">Link da pesquisa:</p>
          <p className="break-all text-sm">{feedbackLink}</p>
        </div>
      )}

      <div className="mt-5">
        <h3 className="font-semibold">Checklist operacional</h3>
        <div className="mt-2 grid gap-2">
          {Object.entries(CHECKLIST_POS_AGENDAMENTO_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input type="checkbox" />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
