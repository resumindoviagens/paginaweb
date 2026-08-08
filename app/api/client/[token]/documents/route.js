export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { hasClientAccess } from "../../../../../lib/clientAuth";
import { extractDocumentData } from "../../../../../lib/documentExtraction";

const BUCKET = "resumindo-docs";

function safeName(name = "documento") {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

async function getClient(token) {
  const verified = await hasClientAccess(token);
  if (!verified) return { error: "Confirmação de identidade necessária.", status: 401 };

  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();

  if (error || !client) return { error: "Link inválido.", status: 404 };
  if (client.is_locked) return { error: "Formulário já enviado e bloqueado.", status: 403 };
  return { client };
}

function basicExtractionPlaceholder(documentType) {
  // V110 cria a estrutura de upload e conferência. OCR/leitura automática real entra na próxima etapa.
  if (documentType === "passport") {
    return {
      numeroPassaporte: "",
      dataEmissaoPassaporte: "",
      validadePassaporte: "",
      localEmissaoPassaporte: "",
      paisEmissaoPassaporte: "Brasil"
    };
  }
  if (documentType === "previous_visa") {
    return {
      tipoVistoAnterior: "",
      numeroVistoAnterior: "",
      dataEmissaoVistoAnterior: "",
      validadeVistoAnterior: ""
    };
  }
  return {};
}

export async function GET(request, context) {
  const params = await context.params;
  const { client, error, status } = await getClient(params.token);
  if (error) return Response.json({ error, needs_verification: status === 401 }, { status });

  const { data, error: listError } = await supabaseAdmin
    .from("client_documents")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (listError) return Response.json({ error: listError.message }, { status: 500 });
  return Response.json({ documents: data || [] });
}

export async function POST(request, context) {
  const params = await context.params;
  const { client, error, status } = await getClient(params.token);
  if (error) return Response.json({ error, needs_verification: status === 401 }, { status });

  const form = await request.formData();
  const file = form.get("file");
  const documentType = String(form.get("document_type") || "other");

  if (!file || typeof file === "string") {
    return Response.json({ error: "Arquivo não recebido." }, { status: 400 });
  }

  const allowed = ["passport", "previous_visa", "other"];
  if (!allowed.includes(documentType)) {
    return Response.json({ error: "Tipo de documento inválido." }, { status: 400 });
  }

  const maxSize = 15 * 1024 * 1024;
  if (file.size > maxSize) {
    return Response.json({ error: "Arquivo acima de 15 MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `clients/${client.id}/${documentType}/${Date.now()}-${safeName(file.name)}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

  const extraction = await extractDocumentData({ documentType, buffer, mimeType: file.type || "" });
  const extracted = extraction.data || {};

  const { data: saved, error: insertError } = await supabaseAdmin
    .from("client_documents")
    .insert({
      client_id: client.id,
      document_type: documentType,
      file_name: file.name,
      file_path: path,
      mime_type: file.type || "",
      size_bytes: file.size,
      extracted_data: extracted,
      extraction_status: extraction.status || "pending",
      extraction_error: extraction.error || "",
      extraction_raw: extraction.raw || "",
      extraction_model: extraction.model || "",
      extraction_attempted_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 });

  await supabaseAdmin.from("audit_logs").insert({
    client_id: client.id,
    action: "client_uploaded_document",
    details: { document_type: documentType, file_name: file.name, file_path: path, extraction_status: extraction.status, extraction_error: extraction.error || "" }
  });

  return Response.json({
    ok: true,
    document: saved,
    extracted_data: extracted,
    extraction_status: extraction.status || "pending",
    extraction_error: extraction.error || "",
    message: extraction.status === "extracted" ? "Documento anexado e dados extraídos para conferência." : `Documento anexado. Não foi possível extrair dados automaticamente agora (${extraction.status || "sem status"}). Você pode seguir normalmente.`
  });
}
