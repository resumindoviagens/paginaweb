'use client';

import { useState } from 'react';

type Props = {
  clientId: string;
  clienteNome?: string;
  processoEncerrado?: boolean;
};

export default function Item11PesquisaSatisfacao({ clientId, processoEncerrado }: Props) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  async function liberarPesquisa() {
    setLoading(true);

    try {
      const res = await fetch('/api/feedback/liberar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Não foi possível liberar a pesquisa.');
        return;
      }

      setLink(data.link);
      await navigator.clipboard.writeText(data.link);
      alert('Pesquisa liberada. Link copiado para a área de transferência.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border p-3">
      <button
        type="button"
        disabled={!processoEncerrado || loading}
        onClick={liberarPesquisa}
        className={`w-full rounded-xl px-4 py-3 font-semibold ${
          processoEncerrado ? 'bg-orange-500 text-white' : 'cursor-not-allowed bg-gray-100 text-gray-400'
        }`}
        title={!processoEncerrado ? 'Disponível após marcar Passaporte recebido / encerramento.' : 'Enviar pesquisa de satisfação'}
      >
        11 - Enviar pesquisa de satisfação
      </button>

      {!processoEncerrado && (
        <p className="mt-2 text-xs text-gray-500">
          Disponível após marcar “10 - Passaporte recebido / encerramento”.
        </p>
      )}

      {link && (
        <div className="mt-3 rounded-lg bg-gray-50 p-2 text-xs">
          <p className="font-semibold">Link gerado:</p>
          <p className="break-all">{link}</p>
        </div>
      )}
    </div>
  );
}
