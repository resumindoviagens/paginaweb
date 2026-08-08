type Props = {
  comentario: string;
  nomePublico?: string;
  cidade?: string;
  nota?: number;
};

export default function FeedbackPostCard({
  comentario,
  nomePublico = 'Cliente Resumindo Viagens',
  cidade = 'Brasil',
  nota = 10,
}: Props) {
  return (
    <div className="flex h-[1080px] w-[1080px] flex-col justify-between bg-[#0B1F4D] p-16 text-white">
      <div>
        <p className="text-3xl font-semibold tracking-wide">RESUMINDO VIAGENS</p>
        <p className="mt-2 text-xl opacity-80">Assessoria para Visto Americano</p>
      </div>

      <div className="rounded-3xl bg-white/10 p-10 shadow-2xl">
        <p className="text-5xl">“</p>
        <p className="mt-4 text-4xl font-semibold leading-tight">{comentario}</p>
        <p className="mt-8 text-2xl opacity-90">— {nomePublico}, {cidade}</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-2xl">Nota {nota}/10</p>
        <p className="text-xl opacity-80">@resumindoviagens</p>
      </div>
    </div>
  );
}
