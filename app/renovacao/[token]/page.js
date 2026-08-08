import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import BrandHeader from "../../../components/BrandHeader";

export default async function RenovacaoRastreioPage({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();

  if (!client) return <main style={{ padding: 30 }}>Link inválido.</main>;

  if (!client.is_renewal) {
    return (
      <main style={{ maxWidth: 720, margin: "50px auto", padding: 24 }}>
        <div className="card" style={{ padding: 30 }}>
          <BrandHeader compact />
          <h2 style={{ color: "var(--navy)" }}>Rastreio não necessário</h2>
          <p>Este link é utilizado apenas para processos de renovação sem entrevista.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "50px auto", padding: 24 }}>
      <div className="card" style={{ padding: 30 }}>
        <BrandHeader compact />
        <h2 style={{ color: "var(--navy)", marginTop: 24 }}>Envio do rastreio do Sedex</h2>
        <p>Olá, <strong>{client.name}</strong>.</p>
        <p>Informe abaixo o código de rastreio do Sedex utilizado para enviar seus documentos à Resumindo Viagens.</p>
        <form action={`/api/client/${token}/sedex`} method="POST" style={{ marginTop: 18 }}>
          <input name="tracking" placeholder="Código de rastreio do Sedex" defaultValue={client.client_sedex_tracking || ""} required />
          <button className="btn-primary" style={{ marginTop: 14 }} type="submit">Enviar rastreio</button>
        </form>
      </div>
    </main>
  );
}
