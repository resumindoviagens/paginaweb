function safeJsonParse(text) {
  try {
    const cleaned = String(text || "").replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

function normalizeDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const br = raw.match(/^(\d{2})[\/.-](\d{2})[\/.-](\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  return "";
}

function normalizePassport(data = {}) {
  return {
    tipoPassaporte: data.tipoPassaporte || data.passport_type || "Regular",
    numeroPassaporte: data.numeroPassaporte || data.passport_number || "",
    paisEmissor: data.paisEmissor || data.issuing_country || "Brasil",
    cidadeEmissao: data.cidadeEmissao || data.issuing_city || "",
    estadoEmissao: data.estadoEmissao || data.issuing_state || "",
    dataEmissao: normalizeDate(data.dataEmissao || data.issue_date),
    dataVencimento: normalizeDate(data.dataVencimento || data.expiry_date),
    nomeExtraido: data.nomeExtraido || data.full_name || "",
    orgaoEmissorExtraido: data.orgaoEmissorExtraido || data.issuing_authority || ""
  };
}

function normalizeVisa(data = {}) {
  return {
    vistoEmitido: data.vistoEmitido || "Sim",
    dataUltimoVisto: normalizeDate(data.dataUltimoVisto || data.issue_date),
    numeroVisto: data.numeroVisto || data.visa_number || "",
    vistoIssuingPost: data.vistoIssuingPost || data.issuing_post || "",
    categoriaVistoExtraida: data.categoriaVistoExtraida || data.visa_class || "",
    validadeVistoExtraida: normalizeDate(data.validadeVistoExtraida || data.expiry_date)
  };
}

function promptFor(documentType) {
  if (documentType === "passport") {
    return `Extraia dados de um passaporte brasileiro ou estrangeiro. Responda SOMENTE em JSON válido com as chaves:
{
  "tipoPassaporte": "Regular|Oficial|Diplomático|Outro",
  "numeroPassaporte": "",
  "paisEmissor": "",
  "cidadeEmissao": "",
  "estadoEmissao": "",
  "dataEmissao": "YYYY-MM-DD",
  "dataVencimento": "YYYY-MM-DD",
  "nomeExtraido": "",
  "orgaoEmissorExtraido": ""
}
Se não encontrar algum campo, use string vazia. Não invente dados.`;
  }

  return `Extraia dados de um visto americano anterior. Responda SOMENTE em JSON válido com as chaves:
{
  "vistoEmitido": "Sim",
  "dataUltimoVisto": "YYYY-MM-DD",
  "numeroVisto": "",
  "vistoIssuingPost": "Brasília|São Paulo|Rio de Janeiro|Recife|Porto Alegre|Belo Horizonte|",
  "categoriaVistoExtraida": "",
  "validadeVistoExtraida": "YYYY-MM-DD"
}
Se não encontrar algum campo, use string vazia. Não invente dados.`;
}

function truncate(value, max = 4000) {
  return String(value || "").slice(0, max);
}

async function openAIVisionExtract({ documentType, buffer, mimeType }) {
  const model = process.env.OPENAI_DOCUMENT_MODEL || "gpt-4o-mini";
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return {
      status: "no_ai_key",
      data: {},
      raw: "",
      model,
      error: "OPENAI_API_KEY não configurada no ambiente do deploy."
    };
  }

  if (!String(mimeType || "").startsWith("image/")) {
    return {
      status: "unsupported_file_type",
      data: {},
      raw: "",
      model,
      error: `Tipo de arquivo não suportado para leitura automática nesta versão: ${mimeType || "sem mime_type"}`
    };
  }

  const base64 = buffer.toString("base64");
  const body = {
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: promptFor(documentType) },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
        ]
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const responseText = await res.text();

    if (!res.ok) {
      return {
        status: "failed",
        data: {},
        raw: truncate(responseText),
        model,
        error: `OpenAI HTTP ${res.status}: ${truncate(responseText, 1200)}`
      };
    }

    const json = safeJsonParse(responseText);
    const content = json?.choices?.[0]?.message?.content || "{}";
    const parsed = safeJsonParse(content);

    return {
      status: "extracted",
      data: documentType === "passport" ? normalizePassport(parsed) : normalizeVisa(parsed),
      raw: truncate(content),
      model,
      error: ""
    };
  } catch (error) {
    return {
      status: "failed",
      data: {},
      raw: "",
      model,
      error: `Falha na chamada OpenAI: ${error?.message || String(error)}`
    };
  }
}

export async function extractDocumentData({ documentType, buffer, mimeType }) {
  const result = await openAIVisionExtract({ documentType, buffer, mimeType });
  if (result.status === "extracted") return result;

  const fallback = documentType === "passport" ? normalizePassport({}) : normalizeVisa({});
  return { ...result, data: fallback };
}
