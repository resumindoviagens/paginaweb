import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { isAdminAuthenticated } from "../../../../lib/auth";
import BrandHeader from "../../../../components/BrandHeader";
import { sections } from "../../../../lib/formSchema";

function cleanSectionTitle(title) { return title.replace(/^\d+\.\s*/, ""); }
function numberedTitle(index, title) { return `${index + 1}. ${cleanSectionTitle(title)}`; }

function answerLines(field) {
  if (field.type === "textarea" || field.wide || field.full) return "\u00a0\n\u00a0\n\u00a0";
  return "\u00a0";
}

export default async function AdminManualPdfPage({ params }) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <main style={{ padding: 30, fontFamily: "Arial, Helvetica, sans-serif" }}>Acesso não autorizado. Entre no painel admin antes de abrir o PDF.</main>;
  }

  const resolvedParams = await params;
  const token = resolvedParams.token;

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();

  if (!client) return <main style={{ padding: 30 }}>Cliente não encontrado.</main>;

  return (
    <main style={{ maxWidth: 980, margin: "30px auto", padding: 24 }}>
      <div className="no-print" style={{ marginBottom: 18 }}>
        <button className="btn-primary" id="printButton">Gerar PDF / imprimir</button>
      </div>

      <div className="card" style={{ padding: 34 }}>
        <BrandHeader clientName={client.name} />
        <h2 style={{ color: "var(--navy)", marginTop: 28 }}>Formulário para preenchimento à mão</h2>
        <p style={{ color: "var(--muted)" }}>Cliente: <strong>{client.name}</strong></p>
        <p style={{ color: "var(--muted)" }}>Preencha as respostas com letra legível. Depois, fotografe ou digitalize todas as páginas e envie para a Resumindo Viagens.</p>

        {sections.map((section, sectionIndex) => (
          <section key={section.title} style={{ breakInside: "avoid", marginTop: 28 }}>
            <h3 style={{ background: "var(--navy)", color: "#fff", padding: 12, borderRadius: 10 }}>{numberedTitle(sectionIndex, section.title)}</h3>
            <div className="grid">
              {section.fields.map((field, fieldIndex) => (
                <div key={field.id} className={field.wide || field.full ? "wide" : ""} style={{ border: "1px solid #E4E8F0", borderRadius: 12, padding: 12, minHeight: field.type === "textarea" || field.wide || field.full ? 96 : 70 }}>
                  <b style={{ color: "var(--navy)" }}><span style={{ color: "var(--orange)" }}>{sectionIndex + 1}.{fieldIndex + 1}</span> {field.label}</b><br />
                  <div style={{ marginTop: 10, borderBottom: "1px solid #CBD5E1", whiteSpace: "pre-line" }}>{answerLines(field)}</div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="print-footer">Resumindo Viagens • contato@resumindoviagens.com.br • Instagram: @resumindoviagens</div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: "document.getElementById('printButton')?.addEventListener('click', () => window.print())" }} />
    </main>
  );
}
