import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function FotoInstrucoesPage({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("name")
    .eq("access_token", token)
    .maybeSingle();

  const clientName = client?.name || "solicitante";

  return (
    <main className="foto-page">
      <header className="foto-hero">
        <img className="foto-logo" src="/foto/logo.png" alt="Resumindo Viagens" />
        <span className="foto-tag">Foto 5x5 para Visto Americano</span>
        <h1>Instruções para envio da foto</h1>
        <p className="foto-lead">Olá, <strong>{clientName}</strong>. Abaixo seguem as instruções das fotos para o visto americano. Confira atentamente os exemplos visuais e as orientações antes de enviar ou imprimir sua foto.</p>
        <div className="foto-contact-card">
          <a className="foto-contact-link" href="https://wa.me/5511981210932" target="_blank" rel="noopener noreferrer">
            <img src="/whatsapp.svg" alt="WhatsApp" />
            <span>Dúvidas pelo WhatsApp: (11) 98121-0932</span>
          </a>

          <a className="foto-contact-link" href="https://www.instagram.com/resumindoviagens" target="_blank" rel="noopener noreferrer">
            <img src="/instagram.svg" alt="Instagram" />
            <span>Seguir @resumindoviagens</span>
          </a>
        </div>
      </header>

      <section className="foto-poster" aria-label="Exemplos visuais de fotos corretas e incorretas">
        <img src="/foto/infografico_foto_visto.jpg" alt="Infográfico com exemplos corretos e incorretos de foto para visto americano" />
      </section>

      <section className="foto-content">
        <div className="foto-section">
          <h2>Requisitos obrigatórios da foto</h2>
          <ul className="foto-requirements">
            <li><strong>Tamanho:</strong> a foto deve ser no padrão 5x5 cm. Excepcionalmente, pode ser aceita no tamanho 5x7 cm.</li>
            <li><strong>Papel:</strong> deve ser impressa em papel fotográfico. Verifique se há marca d’água no verso do papel.</li>
            <li><strong>Fundo:</strong> branco, liso, uniforme e sem sombras.</li>
            <li><strong>Enquadramento:</strong> cabeça inteira, rosto centralizado, pescoço e parte dos ombros visíveis.</li>
            <li><strong>Expressão:</strong> neutra, sem sorriso, com boca fechada e olhar direcionado para a câmera.</li>
            <li><strong>Óculos:</strong> não são permitidos, mesmo que sejam de grau.</li>
            <li><strong>Cabelo:</strong> não pode cobrir testa, olhos, sobrancelhas ou orelhas.</li>
            <li><strong>Orelhas:</strong> ambas devem estar claramente visíveis. Cabelos longos devem ficar presos ou atrás das orelhas.</li>
            <li><strong>Acessórios:</strong> não usar boné, tiara, arco, presilhas aparentes, lenços, chapéus ou itens na cabeça.</li>
            <li><strong>Roupa:</strong> evite blusa ou camisa branca para não causar efeito de “cabeça flutuante”.</li>
          </ul>
        </div>

        <div className="foto-section">
          <h2>Como deve ser a foto</h2>
          <div className="foto-checklist">
            <div className="foto-box ok"><h3>Foto correta</h3><ul><li>Fundo branco e uniforme.</li><li>Rosto de frente e centralizado.</li><li>Expressão neutra, sem sorriso.</li><li>Sem óculos ou acessórios.</li><li>Testa, sobrancelhas e olhos livres.</li><li>Orelhas visíveis, com cabelo para trás ou preso.</li><li>Pescoço e parte dos ombros aparentes.</li></ul></div>
            <div className="foto-box bad"><h3>Foto incorreta</h3><ul><li>Franja tocando ou cobrindo as sobrancelhas.</li><li>Cabelo cobrindo uma ou ambas as orelhas.</li><li>Sorriso ou expressão exagerada.</li><li>Uso de óculos, boné, tiara ou acessórios.</li><li>Fundo escuro, colorido, com sombras ou objetos.</li><li>Foto cortada, inclinada ou fora do padrão 5x5.</li><li>Roupa branca causando pouco contraste com o fundo.</li></ul></div>
          </div>
        </div>

        <div className="foto-section">
          <h2>Observação importante</h2>
          <div className="foto-alert">Fotos fora do padrão podem ser recusadas pela embaixada, causando atraso no processo e necessidade de refazer a foto. Em caso de dúvida, envie a foto para conferência antes de realizar a impressão definitiva.</div>
        </div>
      </section>
      <footer className="foto-footer">© Resumindo Viagens — Assessoria Especializada em Vistos</footer>
    </main>
  );
}
