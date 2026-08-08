export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function validEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function classify(email = "", nome = "", defaultCategoria = "Outros") {
  const e = normalizeEmail(email);
  const n = String(nome || "").toLowerCase();
  const text = `${e} ${n}`;

  if (e.includes(".gov") || e.includes("gov.br") || e.includes("state.gov") || text.includes("embassy") || text.includes("consulado") || text.includes("consulate")) return "Governo";
  if (/(hotel|pousada|resort|airline|companhia|aérea|aerea|reservas|reservation|booking|financeiro|contabilidade|fiscal|invoice|billing|pagamento|fornecedor)/i.test(text)) return "Fornecedor";
  if (/(parceiro|partner|agencia|agency|turismo|viagens|operadora)/i.test(text)) return "Parceiro";
  return defaultCategoria || "Outros";
}

function parseCsvLine(line = "") {
  const values = [];
  let current = "";
  let inside = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"' && inside && next === '"') { current += '"'; i++; continue; }
    if (ch === '"') { inside = !inside; continue; }
    if ((ch === "," || ch === ";") && !inside) { values.push(current.trim()); current = ""; continue; }
    current += ch;
  }
  values.push(current.trim());
  return values;
}

function parseCsv(text = "") {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const first = parseCsvLine(lines[0]).map((h) => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const hasHeader = first.some((h) => ["email", "e-mail", "nome", "name", "telefone", "categoria", "observacao", "observacoes"].includes(h));

  const rows = [];
  const start = hasHeader ? 1 : 0;
  const headers = hasHeader ? first : ["nome", "email", "telefone", "categoria", "observacoes"];

  for (let i = start; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] || "";
    });
    rows.push({
      nome: row.nome || row.name || "",
      email: row.email || row["e-mail"] || "",
      telefone: row.telefone || row.phone || "",
      categoria: row.categoria || "",
      observacoes: row.observacoes || row.observacao || row.notes || ""
    });
  }

  return rows;
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const origem = body.origem || "csv_import";
  const defaultCategoria = body.categoria || "Outros";
  const autoClassificar = body.auto_classificar !== false;

  const rows = Array.isArray(body.rows) ? body.rows : parseCsv(body.csv || "");
  const report = {
    total_linhas: rows.length,
    novos: 0,
    atualizados: 0,
    existentes_ignorados: 0,
    invalidos: 0,
    protegidos_ignorados: 0,
    erros: []
  };

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index] || {};
    const email = String(row.email || "").trim();
    const emailNormalized = normalizeEmail(email);

    if (!validEmail(emailNormalized)) {
      report.invalidos++;
      report.erros.push({ linha: index + 1, email, erro: "Email inválido" });
      continue;
    }

    const categoria = autoClassificar ? classify(emailNormalized, row.nome, row.categoria || defaultCategoria) : (row.categoria || defaultCategoria);

    const { data: existing, error: readError } = await supabaseAdmin
      .from("newsletter_contacts")
      .select("*")
      .eq("email_normalized", emailNormalized)
      .maybeSingle();

    if (readError) {
      report.erros.push({ linha: index + 1, email, erro: readError.message });
      continue;
    }

    if (!existing) {
      const { error } = await supabaseAdmin.from("newsletter_contacts").insert({
        email,
        email_normalized: emailNormalized,
        nome: row.nome || "",
        telefone: row.telefone || "",
        origem,
        categoria,
        status: origem === "gmail_import" ? "pending_review" : "active",
        aceita_newsletter: origem === "gmail_import" ? false : true,
        observacoes: row.observacoes || ""
      });

      if (error) {
        report.erros.push({ linha: index + 1, email, erro: error.message });
      } else {
        report.novos++;
      }
      continue;
    }

    if (["unsubscribed", "blocked", "bounced"].includes(existing.status) || existing.aceita_newsletter === false) {
      report.protegidos_ignorados++;
      continue;
    }

    const updates = { atualizado_em: new Date().toISOString() };
    if (!existing.nome && row.nome) updates.nome = row.nome;
    if (!existing.telefone && row.telefone) updates.telefone = row.telefone;
    if (!existing.categoria && categoria) updates.categoria = categoria;
    if (!existing.observacoes && row.observacoes) updates.observacoes = row.observacoes;

    if (Object.keys(updates).length > 1) {
      const { error } = await supabaseAdmin.from("newsletter_contacts").update(updates).eq("id", existing.id);
      if (error) report.erros.push({ linha: index + 1, email, erro: error.message });
      else report.atualizados++;
    } else {
      report.existentes_ignorados++;
    }
  }

  return Response.json({ ok: true, report });
}
