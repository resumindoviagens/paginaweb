import BrandHeader from "../components/BrandHeader";

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "60px auto", padding: 20 }}>
      <div className="card" style={{ padding: 32 }}>
        <BrandHeader compact />
        <div style={{ marginTop: 24 }} className="secure-alert">
          Este formulário é acessado por link seguro individual enviado pela Resumindo Viagens.
        </div>
        <p style={{ marginTop: 18 }}>Se você é administrador, acesse o painel interno.</p>
        <a className="btn-primary" href="/admin" style={{ display: "inline-block" }}>Acesso interno</a>
      </div>
    </main>
  );
}
