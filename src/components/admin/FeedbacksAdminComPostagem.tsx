'use client';

export default function FeedbacksAdminComPostagem() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Feedbacks</h1>
      <p className="mt-2 text-gray-600">
        Aqui você verá as pesquisas respondidas pelos clientes.
      </p>

      <div className="mt-6 rounded-2xl border p-4">
        <p className="font-semibold">Quando houver resposta, mostrar:</p>
        <ul className="mt-2 list-disc pl-6 text-sm">
          <li>Cliente</li>
          <li>Nota</li>
          <li>Ponto forte</li>
          <li>Comentário</li>
          <li>Autorização de divulgação</li>
          <li>Botão “Gerar postagem Instagram”</li>
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border p-4">
        <button className="rounded-xl bg-blue-900 px-4 py-3 font-semibold text-white">
          Gerar postagem Instagram
        </button>
        <p className="mt-2 text-xs text-gray-500">
          Este botão deve ficar ativo somente quando o cliente autorizou o uso parcial do depoimento.
        </p>
      </div>
    </main>
  );
}
