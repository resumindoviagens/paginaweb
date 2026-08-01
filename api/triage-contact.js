// LEGADO V4.5: mantido apenas para compatibilidade com registros antigos.
import { authenticatedUser, hasSupabaseConfig, secretSupabaseClient } from "../lib/supabase-server.js";
const EMAIL_TO = "contato@resumindoviagens.com.br";
const SITE_URL = "https://www.resumindoviagens.com.br";
function clean(value, max = 5000) { return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max); }
function escapeHtml(value) { return clean(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]); }
function normalizePhone(value) { let digits = clean(value, 30).replace(/\D/g, ""); if (digits.length === 10 || digits.length === 11) digits = `55${digits}`; return digits.length >= 12 && digits.length <= 13 && digits.startsWith("55") ? digits : ""; }
function preferenceLabel(value) { return ({morning:"Manhã",afternoon:"Tarde",evening:"Noite",any:"Qualquer horário"})[value] || ""; }
async function sendBrevo({ subject, htmlContent, textContent, tag, referenceCode }) {
  if (!process.env.BREVO_API_KEY) return { ok:false, notConfigured:true };
  const response = await fetch("https://api.brevo.com/v3/smtp/email", { method:"POST", headers:{accept:"application/json","api-key":process.env.BREVO_API_KEY,"content-type":"application/json"}, body:JSON.stringify({sender:{name:"Resumindo Viagens — Orientação",email:EMAIL_TO},to:[{name:"Resumindo Viagens",email:EMAIL_TO}],replyTo:{name:"Resumindo Viagens",email:EMAIL_TO},subject,htmlContent,textContent,tags:[tag],headers:{"X-Triage-Code":referenceCode}}) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) { console.error("Brevo triage error", response.status, payload); return {ok:false,status:response.status,code:payload?.code||null}; }
  return {ok:true,messageId:payload.messageId||null};
}
export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store, max-age=0"); res.setHeader("X-Content-Type-Options","nosniff");
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Método não permitido."});}
  if(!hasSupabaseConfig())return res.status(503).json({error:"O banco do chatbot ainda não foi configurado."});
  const user=await authenticatedUser(req); if(!user)return res.status(401).json({error:"Sessão não autenticada."});
  const sessionId=clean(req.body?.sessionId,80), mode=clean(req.body?.mode,20);
  if(!sessionId||!["summary","whatsapp","callback"].includes(mode))return res.status(400).json({error:"Solicitação inválida."});
  const db=secretSupabaseClient();
  const {data:session,error:sessionError}=await db.from("chat_sessions").select("id,visitor_id,visitor_name,started_at,page_url,triage_id").eq("id",sessionId).maybeSingle();
  if(sessionError)return res.status(500).json({error:"Não foi possível consultar o atendimento."});
  if(!session||session.visitor_id!==user.id)return res.status(403).json({error:"Atendimento não autorizado."});
  const {data:triage,error:triageError}=await db.from("triage_submissions").select("*").eq("session_id",sessionId).maybeSingle();
  if(triageError)return res.status(500).json({error:"Não foi possível consultar a triagem."});
  if(!triage)return res.status(404).json({error:"A triagem ainda não foi concluída."});
  const now=new Date().toISOString(); let name=clean(req.body?.name||session.visitor_name,60),phone="",preference="",consent=false;
  if(mode==="callback"){
    phone=normalizePhone(req.body?.phone); preference=clean(req.body?.preference,20); consent=req.body?.consent===true;
    if(name.length<2)return res.status(400).json({error:"Informe seu primeiro nome."});
    if(!phone)return res.status(400).json({error:"Informe um WhatsApp válido com DDD."});
    if(!preferenceLabel(preference))return res.status(400).json({error:"Escolha o melhor período para contato."});
    if(!consent)return res.status(400).json({error:"É necessário autorizar o contato pelo WhatsApp."});
    if(triage.callback_email_sent_at&&triage.contact_phone===phone&&triage.visitor_name===name)return res.status(200).json({ok:true,alreadySent:true,emailSent:true,referenceCode:triage.reference_code});
  }
  const updates={updated_at:now};
  if(mode==="whatsapp")updates.continuation_mode="whatsapp";
  else if(mode==="callback")Object.assign(updates,{visitor_name:name,contact_phone:phone,contact_preference:preference,contact_consent:true,continuation_mode:"callback",contact_status:"waiting_contact"});
  const {error:updateError}=await db.from("triage_submissions").update(updates).eq("id",triage.id); if(updateError)return res.status(500).json({error:"Não foi possível atualizar a triagem."});
  if(mode==="whatsapp")return res.status(200).json({ok:true,emailSent:null,referenceCode:triage.reference_code});
  if(mode==="summary"&&triage.email_sent_at)return res.status(200).json({ok:true,alreadySent:true,emailSent:true,referenceCode:triage.reference_code});
  const adminUrl=`${SITE_URL}/admin?triagem=${encodeURIComponent(triage.reference_code)}`;
  const customerWhatsappUrl=phone?`https://wa.me/${phone}?text=${encodeURIComponent(`Olá, ${name}! Aqui é da Resumindo Viagens. Recebemos sua solicitação e a triagem de código ${triage.reference_code}. Podemos continuar seu atendimento por aqui?`)}`:"";
  const title=mode==="callback"?"Solicitação de contato pelo WhatsApp":"Nova triagem concluída";
  const subject=mode==="callback"?`Solicitação de contato — ${triage.reference_code}`:`Nova triagem do site — ${triage.reference_code}`;
  const contactHtml=mode==="callback"?`<div style="margin:18px 0;padding:18px;border-radius:14px;background:#e9f8ef;border:1px solid #bce5cb"><h2 style="margin:0 0 12px;font-size:18px;color:#116838">Retorno solicitado</h2><p><strong>Primeiro nome:</strong> ${escapeHtml(name)}</p><p><strong>WhatsApp:</strong> +${escapeHtml(phone)}</p><p><strong>Melhor período:</strong> ${escapeHtml(preferenceLabel(preference))}</p><p><strong>Consentimento:</strong> autorizado para continuidade deste atendimento.</p><p style="margin-top:18px"><a href="${escapeHtml(customerWhatsappUrl)}" style="display:inline-block;padding:12px 18px;border-radius:9px;background:#25d366;color:white;text-decoration:none;font-weight:bold">Abrir conversa no WhatsApp</a></p></div>`:"";
  const formattedDate=new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo",dateStyle:"medium",timeStyle:"short"}).format(new Date(triage.created_at));
  const htmlContent=`<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Arial,sans-serif;color:#172b49"><div style="max-width:760px;margin:24px auto;background:#fff;border:1px solid #dfe6ef;border-radius:18px;overflow:hidden"><div style="padding:24px 28px;background:#04173d;color:white"><div style="color:#f0a000;font-size:12px;font-weight:bold;text-transform:uppercase">Resumindo Viagens</div><h1 style="margin:7px 0 0;font-size:24px">${escapeHtml(title)}</h1></div><div style="padding:24px 28px"><p><strong>Código:</strong> ${escapeHtml(triage.reference_code)}</p><p><strong>Nome informado:</strong> ${escapeHtml(name||session.visitor_name||"Não informado")}</p><p><strong>Data:</strong> ${escapeHtml(formattedDate)}</p>${contactHtml}<h2 style="font-size:18px;margin-top:24px">Resumo da triagem</h2><pre style="white-space:pre-wrap;font:14px/1.55 Arial,sans-serif;padding:18px;background:#f6f8fc;border-radius:12px;border:1px solid #e2e8f0">${escapeHtml(triage.summary_text)}</pre><p style="margin-top:20px"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:12px 18px;border-radius:9px;background:#0a3a7c;color:white;text-decoration:none;font-weight:bold">Abrir triagem no painel</a></p><p style="font-size:12px;color:#6c7b91;margin-top:20px">O código relaciona a triagem ao atendimento, mas não deve ser usado como autenticação de identidade.</p></div></div></body></html>`;
  const textContent=`${title.toUpperCase()}\n\nCódigo: ${triage.reference_code}\nNome: ${name||session.visitor_name||"Não informado"}\n${mode==="callback"?`WhatsApp: +${phone}\nMelhor período: ${preferenceLabel(preference)}\nConsentimento: autorizado\n`:""}\nRESUMO DA TRIAGEM\n\n${triage.summary_text}\n\nPainel: ${adminUrl}`;
  const sent=await sendBrevo({subject,htmlContent,textContent,tag:mode==="callback"?"triagem-retorno":"triagem-site",referenceCode:triage.reference_code});
  if(!sent.ok)return res.status(sent.notConfigured?503:502).json({error:sent.notConfigured?"O envio de e-mail ainda não foi configurado.":"A triagem foi salva, mas o e-mail não pôde ser enviado.",saved:true,emailSent:false,providerStatus:sent.status||null,providerCode:sent.code||null,referenceCode:triage.reference_code});
  const emailUpdate=mode==="callback"?{callback_email_sent_at:now,callback_email_message_id:sent.messageId}:{email_sent_at:now,email_message_id:sent.messageId}; await db.from("triage_submissions").update(emailUpdate).eq("id",triage.id);
  return res.status(200).json({ok:true,emailSent:true,messageId:sent.messageId,referenceCode:triage.reference_code});
}
