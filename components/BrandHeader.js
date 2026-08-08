const WHATSAPP_NUMBER = "(11) 98121-0932";
const WHATSAPP_LINK = "https://wa.me/5511981210932";
const INSTAGRAM_USER = "@resumindoviagens";
const INSTAGRAM_LINK = "https://www.instagram.com/resumindoviagens";

export default function BrandHeader({ clientName, compact = false }) {
  return (
    <div className="brand-header brand-header-enhanced">
      <img src="/logo.png" alt="Resumindo Viagens" />

      <div className="brand-main">
        <h1 className="brand-title">Resumindo Viagens</h1>

        <div className="brand-subtitle">
          Formulário para inserção de dados para solicitação de Visto
        </div>

        {!compact && (
          <div className="brand-explanation">
            Este não é o formulário do consulado, suas informações serão analisadas, traduzidas para inglês e inseridas no formulário oficial do consulado.
          </div>
        )}

        {!compact && (
          <div className="brand-contact brand-contact-social">
            <a className="brand-social-link whatsapp" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Resumindo Viagens pelo WhatsApp">
              <img src="/whatsapp.svg" alt="WhatsApp" />
              <span>WhatsApp: {WHATSAPP_NUMBER}</span>
            </a>

            <a className="brand-social-link instagram" href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" aria-label="Seguir a Resumindo Viagens no Instagram">
              <img src="/instagram.svg" alt="Instagram" />
              <span>Instagram: {INSTAGRAM_USER}</span>
            </a>
          </div>
        )}
      </div>

      {!compact && clientName && (
        <div className="brand-client">
          <span>Cliente</span>
          <strong>{clientName}</strong>
        </div>
      )}
    </div>
  );
}
