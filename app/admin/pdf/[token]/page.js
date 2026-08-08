import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { isAdminAuthenticated } from "../../../../lib/auth";
import BrandHeader from "../../../../components/BrandHeader";
import { sections } from "../../../../lib/formSchema";

function cleanSectionTitle(title) { return title.replace(/^\d+\.\s*/, ""); }
function numberedTitle(index, title) { return `${index + 1}. ${cleanSectionTitle(title)}`; }

function isFilled(value) {
  if (value === true) return true;
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim() !== "";
}

const MONTHS_PT = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

function formatAnswer(value) {
  if (!isFilled(value)) return "NÃO RESPONDIDO";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.join(", ");
  const raw = String(value);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  if (iso) {
    const month = MONTHS_PT[Number(iso[2]) - 1] || iso[2];
    return `${iso[3]}/${month}/${iso[1]}`;
  }
  return raw;
}


function questionNumberForField(fields, fieldIndex, sectionNumber) {
  const field = fields[fieldIndex];
  if (field?.questionNumber) return field.questionNumber;
  const count = fields.slice(0, fieldIndex + 1).reduce((total, item) => item.type === "subtitle" ? total : total + (typeof item.numberingWeight === "number" ? item.numberingWeight : 1), 0);
  return `${sectionNumber}.${count}`;
}

export default async function AdminPdfPage({ params }) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main style={{ padding: 30, fontFamily: "Arial, Helvetica, sans-serif" }}>
        Acesso não autorizado. Entre no painel admin antes de abrir o PDF.
      </main>
    );
  }

  const resolvedParams = await params;
  const token = resolvedParams.token;

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();

  if (!client) return <main style={{ padding: 30 }}>Cliente não encontrado.</main>;

  const { data: response } = await supabaseAdmin
    .from("form_responses")
    .select("*")
    .eq("client_id", client.id)
    .maybeSingle();

  const answers = response?.answers || {};

  return (
    <main style={{ maxWidth: 980, margin: "30px auto", padding: 24 }}>
      <div className="no-print" style={{ marginBottom: 18 }}>
        <button className="btn-primary" id="printButton">Gerar PDF / imprimir</button>
      </div>

      <div className="card" style={{ padding: 34 }}>
        <BrandHeader clientName={client.name} />
        {(client.consulate_city || client.family_group || client.passport_tracking_code || client.client_sedex_tracking) && (
          <>
            <h2 style={{ color: "var(--navy)", marginTop: 28 }}>Resumo do processo</h2>
            <div className="grid" style={{ marginBottom: 24 }}>
              {client.consulate_city && <div style={{ border: "1px solid #E4E8F0", borderRadius: 12, padding: 12 }}><b>Consulado</b><br />{client.consulate_city}</div>}
              {client.family_group && <div style={{ border: "1px solid #E4E8F0", borderRadius: 12, padding: 12 }}><b>Grupo familiar</b><br />{client.family_group}</div>}
              {client.passport_protocol && <div style={{ border: "1px solid #E4E8F0", borderRadius: 12, padding: 12 }}><b>Protocolo do passaporte</b><br />{client.passport_protocol}</div>}
              {client.passport_tracking_code && <div style={{ border: "1px solid #E4E8F0", borderRadius: 12, padding: 12 }}><b>Rastreio do passaporte</b><br />{client.passport_tracking_code}</div>}
              {client.client_sedex_tracking && <div style={{ border: "1px solid #E4E8F0", borderRadius: 12, padding: 12 }}><b>Rastreio Sedex do cliente</b><br />{client.client_sedex_tracking}</div>}
            </div>
          </>
        )}
        <h2 style={{ color: "var(--navy)", marginTop: 28 }}>Respostas do formulário</h2>

        {sections.map((section, sectionIndex) => (
          <section key={section.title} style={{ breakInside: "avoid", marginTop: 28 }}>
            <h3 style={{ background: "var(--navy)", color: "#fff", padding: 12, borderRadius: 10 }}>{numberedTitle(sectionIndex, section.title)}</h3>
            <div className="grid">
              {section.fields
                .map((field, fieldIndex) => (
                  <div key={field.id} className={field.wide || field.full ? "wide" : ""} style={{ border: "1px solid #E4E8F0", borderRadius: 12, padding: 12 }}>
                    <b style={{ color: "var(--navy)" }}><span style={{ color: "var(--orange)" }}>{questionNumberForField(section.fields, fieldIndex, sectionIndex + 1)}</span> {field.label}</b><br />
                    <span style={{ color: isFilled(answers[field.id]) ? "inherit" : "#b91c1c", fontWeight: isFilled(answers[field.id]) ? 400 : 700 }}>{formatAnswer(answers[field.id])}</span>
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
