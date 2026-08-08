'use client';

const exemplos = [
  {
    cliente: 'Leopoldino Castro',
    nota: 10,
    tipo: 'aprovado',
    ponto: 'videochamada individual',
    comentario: 'O processo foi muito organizado e cheguei muito mais seguro para a entrevista.',
    autorizou: true,
    data: '08/05/2026',
  },
];

export default function FeedbacksAdminExample() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Feedbacks</h1>
      <p className="mt-2 text-gray-600">Aqui você visualiza as avaliações respondidas pelos clientes.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Nota</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Ponto forte</th>
              <th className="p-3">Autorizou</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {exemplos.map((f) => (
              <tr key={f.cliente} className="border-t">
                <td className="p-3">{f.cliente}</td>
                <td className="p-3">{f.nota}</td>
                <td className="p-3">{f.tipo}</td>
                <td className="p-3">{f.ponto}</td>
                <td className="p-3">{f.autorizou ? 'Sim' : 'Não'}</td>
                <td className="p-3">
                  <button className="rounded-xl border px-3 py-2">Ver resposta</button>
                  <button className="ml-2 rounded-xl bg-blue-900 px-3 py-2 text-white" disabled={!f.autorizou}>
                    Gerar postagem Instagram
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-6 rounded-2xl border p-4">
        <h2 className="font-semibold">Resposta completa</h2>
        <p className="mt-2 text-gray-700">{exemplos[0].comentario}</p>
      </section>
    </main>
  );
}
