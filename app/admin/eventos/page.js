"use client";
import { useEffect, useMemo, useState } from "react";

const CONTACTS = {
  whatsapp: "https://wa.me/5511981210932",
  whatsappLabel: "(11) 98121-0932",
  instagram: "https://instagram.com/resumindoviagens",
  instagramLabel: "@resumindoviagens",
  email: "mailto:contato@resumindoviagens.com.br",
  emailLabel: "contato@resumindoviagens.com.br"
};

function dateOnly(value){ if(!value) return null; const d=new Date(String(value).slice(0,10)+"T00:00:00"); return Number.isFinite(d.getTime())?d:null; }
function daysUntil(value){ const d=dateOnly(value); if(!d) return null; const t=new Date(); const b=new Date(t.getFullYear(),t.getMonth(),t.getDate()); return Math.round((d-b)/86400000); }
function formatDateBR(value){ const d=dateOnly(value); return d?d.toLocaleDateString("pt-BR"):"-"; }
function birthdayToday(value){ const d=dateOnly(value); if(!d) return false; const t=new Date(); return d.getDate()===t.getDate() && d.getMonth()===t.getMonth(); }
function cleanPhone(v){ return String(v||"").replace(/\D/g,""); }
function eventKind(event){ if(event.key.includes("12m")) return "12m"; if(event.key.includes("6m")) return "6m"; if(event.key.includes("today")) return "today"; if(event.key.includes("expired")) return "expired"; if(event.key.includes("after")) return "after6m"; return ""; }

function subjectFor(event){
  if(event.type==="birthday") return "Feliz aniversário! ✈️";
  if(event.type==="passport") return eventKind(event)==="expired" ? "Seu passaporte está vencido — podemos ajudar" : "Atenção à validade do seu passaporte";
  return eventKind(event)==="after6m" ? "Seu visto americano venceu há alguns meses — atenção ao prazo de renovação" : "Atenção à validade do seu visto americano";
}

function messageFor(event){
  const name=event.client.name||"cliente";
  if(event.type==="birthday") return `Olá, ${name}.\n\nA Resumindo Viagens deseja um feliz aniversário, com muita saúde, felicidade e novas experiências inesquecíveis.\n\nEsperamos que este novo ciclo seja repleto de conquistas, viagens especiais e momentos marcantes ao lado das pessoas que você ama.\n\nFoi um prazer participar da sua jornada internacional. Conte sempre conosco.\n\nResumindo Viagens\nWhatsApp: ${CONTACTS.whatsappLabel}\nInstagram: ${CONTACTS.instagramLabel}\nEmail: ${CONTACTS.emailLabel}`;
  if(event.type==="passport") {
    if(eventKind(event)==="expired") return `Olá, ${name}.\n\nIdentificamos que seu passaporte já consta como vencido em nosso histórico.\n\nA Resumindo Viagens também auxilia na renovação do passaporte, com preenchimento das informações, emissão/orientação da guia e agendamento do atendimento na Polícia Federal.\n\nSe você pretende viajar, renovar visto ou manter sua documentação pronta, vale resolver isso com antecedência.\n\nPosso te orientar sobre os próximos passos?\n\nResumindo Viagens\nWhatsApp: ${CONTACTS.whatsappLabel}\nInstagram: ${CONTACTS.instagramLabel}\nEmail: ${CONTACTS.emailLabel}`;
    return `Olá, ${name}.\n\nPassando para lembrar que a validade do seu passaporte merece atenção.\n\nMuitos destinos e processos internacionais exigem passaporte válido por um período mínimo, e deixar para a última hora pode dificultar uma viagem ou uma renovação de visto.\n\nA Resumindo Viagens também presta auxílio na renovação do passaporte: preenchimento das informações, orientação da guia e agendamento do atendimento na Polícia Federal.\n\nSe quiser, posso te ajudar a se organizar com antecedência.\n\nResumindo Viagens\nWhatsApp: ${CONTACTS.whatsappLabel}\nInstagram: ${CONTACTS.instagramLabel}\nEmail: ${CONTACTS.emailLabel}`;
  }
  if(eventKind(event)==="after6m") return `Olá, ${name}.\n\nIdentificamos que seu visto americano venceu há alguns meses.\n\nEste é um bom momento para avaliar a renovação, porque a possibilidade de renovação sem entrevista costuma depender do prazo contado a partir do vencimento do visto anterior.\n\nComo essa janela não fica aberta indefinidamente, recomendo verificar o quanto antes se ainda é possível renovar de forma mais simples.\n\nA Resumindo Viagens pode analisar seu caso e orientar o melhor caminho.\n\nResumindo Viagens\nWhatsApp: ${CONTACTS.whatsappLabel}\nInstagram: ${CONTACTS.instagramLabel}\nEmail: ${CONTACTS.emailLabel}`;
  if(eventKind(event)==="today") return `Olá, ${name}.\n\nSeu visto americano consta como vencendo hoje em nosso histórico.\n\nSe você ainda pretende viajar novamente aos Estados Unidos, este é um bom momento para planejar a renovação e evitar perda de prazo ou correria futura.\n\nA Resumindo Viagens pode analisar seu caso e orientar os próximos passos.\n\nResumindo Viagens\nWhatsApp: ${CONTACTS.whatsappLabel}\nInstagram: ${CONTACTS.instagramLabel}\nEmail: ${CONTACTS.emailLabel}`;
  return `Olá, ${name}.\n\nPassando para lembrar que a validade do seu visto americano merece atenção.\n\nPlanejar a renovação com antecedência evita correria e permite avaliar com mais tranquilidade se o seu caso ainda se enquadra em um processo de renovação mais simples.\n\nA Resumindo Viagens pode acompanhar essa nova etapa, analisando seu caso, organizando as informações e orientando o melhor momento para iniciar.\n\nResumindo Viagens\nWhatsApp: ${CONTACTS.whatsappLabel}\nInstagram: ${CONTACTS.instagramLabel}\nEmail: ${CONTACTS.emailLabel}`;
}

function escapeHtml(value = "") {
  return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function headerUrl() {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://app.resumindoviagens.com.br";
  return `${origin.replace(/\/$/, "")}/email-headers/header-orlando-v38.png`;
}

function htmlFromText(text, heading = "Resumindo Viagens"){
  const paragraphs = String(text || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const greeting = paragraphs[0] || "";
  const bodyParagraphs = paragraphs.slice(1).map((p) =>
    `<p style="margin:0 0 14px;">${escapeHtml(p).replace(/\n/g,"<br />")}</p>`
  ).join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.62;max-width:720px;margin:0 auto;background:#f6f8fb;padding:0;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
    <div style="background:#1f2a60;"><img src="${headerUrl()}" alt="Resumindo Viagens - Orlando" width="720" style="width:100%;max-width:720px;height:auto;display:block;border:0;outline:none;text-decoration:none;" /></div>
    <div style="background:#ffffff;padding:28px;">
      <p style="margin:0 0 4px;color:#f59e0b;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.4px;">Orlando</p>
      <h2 style="color:#1f2a60;margin:0 0 20px;font-size:24px;line-height:1.25;">${escapeHtml(heading)}</h2>
      ${greeting ? `<p style="margin:0 0 18px;font-size:18px;"><strong>${escapeHtml(greeting)}</strong></p>` : ""}
      ${bodyParagraphs}
      <p style="margin:22px 0;text-align:left;">
        <a href="${CONTACTS.whatsapp}" style="background:#1f2a60;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:8px;display:inline-block;font-weight:700;">Falar com a Resumindo Viagens</a>
      </p>
      <div style="border-top:1px solid #e5e7eb;margin-top:26px;padding-top:18px;">
        <p style="margin:0 0 8px;color:#374151;">Se precisar de qualquer coisa, conte comigo:</p>
        <p style="margin:0 0 6px;">📧 <a href="${CONTACTS.email}" style="color:#1f2a60;text-decoration:underline;">${CONTACTS.emailLabel}</a></p>
        <p style="margin:0 0 6px;">📱 <a href="${CONTACTS.whatsapp}" style="color:#1f2a60;text-decoration:underline;">WhatsApp: ${CONTACTS.whatsappLabel}</a></p>
        <p style="margin:0 0 14px;">📸 <a href="${CONTACTS.instagram}" style="color:#1f2a60;text-decoration:underline;">Instagram: ${CONTACTS.instagramLabel}</a></p>
        <p style="margin:18px 0 0;">Atenciosamente,<br /><strong>Resumindo Viagens</strong></p>
      </div>
    </div>
  </div>`;
}

export default function CentralEventosPage(){
  const [clients,setClients]=useState([]),[dismissed,setDismissed]=useState(new Set()),[tab,setTab]=useState("todos"),[preview,setPreview]=useState(null),[composer,setComposer]=useState(null),[sending,setSending]=useState(false);
  async function load(){
    const [cr,dr]=await Promise.all([fetch("/api/admin/clients",{cache:"no-store"}),fetch("/api/admin/events/dismiss",{cache:"no-store"})]);
    const cd=await cr.json(); if(!cr.ok){alert(cd.error||"Erro ao carregar clientes."); return;} setClients(cd.clients||[]);
    const dd=await dr.json(); if(dr.ok) setDismissed(new Set(dd.dismissed||[]));
  }
  useEffect(()=>{load();},[]);
  const events=useMemo(()=>{
    const list=[];
    clients.forEach(client=>{
      const concluded=!!(client.is_completed||client.stage_ready_to_archive||client.visa_result==="approved"||client.stage_passport_returned);
      if(birthdayToday(client.birth_date)) list.push({key:`birthday-${client.id}-${new Date().getFullYear()}`,type:"birthday",category:concluded?"aniversario_concluido":"aniversario_andamento",title:concluded?"Aniversário — cliente concluído/aprovado":"Aniversário — processo em andamento",client,date:client.birth_date,severity:concluded?"relacionamento":"atenção manual"});
      const pd=daysUntil(client.passport_expiration_date);
      if(pd!==null){
        if(pd<=370&&pd>=330) list.push({key:`passport-12m-${client.id}-${client.passport_expiration_date}`,type:"passport",category:"passaporte",title:"Passaporte vence em aproximadamente 12 meses",client,date:client.passport_expiration_date,severity:"preventivo"});
        if(pd<=190&&pd>=150) list.push({key:`passport-6m-${client.id}-${client.passport_expiration_date}`,type:"passport",category:"passaporte",title:"Passaporte vence em aproximadamente 6 meses",client,date:client.passport_expiration_date,severity:"importante"});
        if(pd<0) list.push({key:`passport-expired-${client.id}-${client.passport_expiration_date}`,type:"passport",category:"passaporte",title:"Passaporte vencido",client,date:client.passport_expiration_date,severity:"atenção"});
      }
      const vd=daysUntil(client.visa_expiration_date);
      if(vd!==null){
        const after=-vd;
        if(vd<=370&&vd>=330) list.push({key:`visa-12m-${client.id}-${client.visa_expiration_date}`,type:"visa",category:"visto",title:"Visto vence em aproximadamente 1 ano",client,date:client.visa_expiration_date,severity:"preventivo"});
        if(vd<=190&&vd>=150) list.push({key:`visa-6m-${client.id}-${client.visa_expiration_date}`,type:"visa",category:"visto",title:"Visto vence em aproximadamente 6 meses",client,date:client.visa_expiration_date,severity:"importante"});
        if(vd===0) list.push({key:`visa-today-${client.id}-${client.visa_expiration_date}`,type:"visa",category:"visto",title:"Visto vence hoje",client,date:client.visa_expiration_date,severity:"atenção"});
        if(after>=170&&after<=200) list.push({key:`visa-after-6m-${client.id}-${client.visa_expiration_date}`,type:"visa",category:"visto",title:"Visto vencido há aproximadamente 6 meses",client,date:client.visa_expiration_date,severity:"urgente elegante"});
      }
    });
    return list.filter(e=>!dismissed.has(e.key)).filter(e=>tab==="todos"||e.category===tab).sort((a,b)=>(a.client.name||"").localeCompare(b.client.name||"","pt-BR"));
  },[clients,dismissed,tab]);
  async function dismiss(event,action="treated"){
    const r=await fetch("/api/admin/events/dismiss",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event_key:event.key,event_type:event.type,client_id:event.client.id,action})});
    const d=await r.json(); if(!r.ok){alert(d.error||"Erro ao baixar evento."); return;} setDismissed(c=>new Set([...c,event.key]));
  }
  function openWhatsApp(event){ const phone=cleanPhone(event.client.phone); if(!phone){alert("Cliente sem telefone cadastrado."); return;} window.open(`https://wa.me/${phone}?text=${encodeURIComponent(messageFor(event))}`,"_blank","noopener,noreferrer"); }
  function openEmail(event){ setComposer({event,toEmail:event.client.email||"",subject:subjectFor(event),plainText:messageFor(event),html:htmlFromText(messageFor(event), subjectFor(event))}); }
  function generatePreview(){ setComposer(c=>({...c,html:htmlFromText(c.plainText, c.subject)})); }
  async function sendEmail(){
    if(!composer?.toEmail){ alert("Cliente sem email cadastrado."); return; }
    setSending(true);
    try{
      const res=await fetch("/api/admin/email-compose/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({client_id:composer.event.client.id,template_id:`evento_${composer.event.type}`,to_email:composer.toEmail,to_name:composer.event.client.name,subject:composer.subject,html:composer.html,text:composer.plainText})});
      const data=await res.json();
      if(!res.ok){ alert(data.error||"Erro ao enviar email."); return; }
      alert("Email enviado com sucesso.");
      await dismiss(composer.event,"email_sent");
      setComposer(null);
    } finally { setSending(false); }
  }
  return <main style={{maxWidth:1180,margin:"30px auto",padding:24,fontFamily:"Arial, Helvetica, sans-serif"}}>
    <h1 style={{color:"#1f2a60"}}>Central de Eventos</h1><p>Automação assistida: o sistema detecta oportunidades e prepara mensagens, mas você decide o envio.</p>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",margin:"18px 0"}}>{[["todos","Todos"],["aniversario_concluido","Aniversários concluídos"],["aniversario_andamento","Aniversários em andamento"],["passaporte","Passaporte"],["visto","Visto americano"]].map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"10px 14px",borderRadius:10,border:0,background:tab===k?"#1f2a60":"#e5e7eb",color:tab===k?"#fff":"#111827"}}>{l}</button>)}</div>
    <div style={{display:"grid",gap:14}}>{events.map(event=><section key={event.key} style={{border:"1px solid #e5e7eb",borderRadius:16,background:"#fff",padding:18}}>
      <h3 style={{margin:"0 0 6px",color:"#1f2a60"}}>{event.title}</h3><p><strong>{event.client.name}</strong></p><p>Data: {formatDateBR(event.date)} • {event.severity}</p><p>{event.client.email||"-"} • {event.client.phone||"-"}</p>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button onClick={()=>setPreview(event)}>Visualizar mensagem</button><button disabled={!event.client.email} onClick={()=>openEmail(event)}>Email</button><button onClick={()=>openWhatsApp(event)}>WhatsApp</button><button onClick={()=>dismiss(event,"treated")}>Marcar tratado</button><button onClick={()=>dismiss(event,"ignored")}>Ignorar</button>{event.type==="passport"&&<button onClick={()=>dismiss(event,"passport_renewed")}>Passaporte renovado</button>}{event.type==="visa"&&<button onClick={()=>dismiss(event,"visa_renewed")}>Visto renovado</button>}</div>
    </section>)}</div>
    {events.length===0&&<p>Nenhum evento pendente nesta visão.</p>}
    {preview&&<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:40}} onClick={()=>setPreview(null)}><div style={{background:"#fff",borderRadius:18,padding:24,maxWidth:760,width:"94vw"}} onClick={e=>e.stopPropagation()}><button style={{float:"right"}} onClick={()=>setPreview(null)}>×</button><h2>{preview.title}</h2><textarea readOnly value={messageFor(preview)} style={{width:"100%",minHeight:260,padding:12,borderRadius:12,border:"1px solid #d1d5db",fontSize:15,lineHeight:1.5}}/><p>Use este texto como base. Nesta etapa não há envio automático externo.</p></div></div>}
    {composer&&<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:50}} onClick={()=>setComposer(null)}><div style={{background:"#fff",borderRadius:18,padding:24,maxWidth:1000,width:"96vw",maxHeight:"92vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}><button style={{float:"right"}} onClick={()=>setComposer(null)}>×</button><h2>Email — {composer.event.title}</h2><label><strong>Para</strong><input value={composer.toEmail} onChange={e=>setComposer({...composer,toEmail:e.target.value})} style={{width:"100%",padding:10,border:"1px solid #d1d5db",borderRadius:10,margin:"6px 0 10px"}}/></label><label><strong>Assunto</strong><input value={composer.subject} onChange={e=>setComposer({...composer,subject:e.target.value})} style={{width:"100%",padding:10,border:"1px solid #d1d5db",borderRadius:10,margin:"6px 0 10px"}}/></label><label><strong>Mensagem</strong><textarea value={composer.plainText} onChange={e=>setComposer({...composer,plainText:e.target.value})} style={{width:"100%",minHeight:210,padding:10,border:"1px solid #d1d5db",borderRadius:10,fontSize:15,lineHeight:1.5,margin:"6px 0 10px"}}/></label><button onClick={generatePreview}>Gerar pré-visualização</button><h3>Pré-visualização</h3><div style={{border:"1px solid #e5e7eb",borderRadius:14,padding:16,maxHeight:320,overflow:"auto"}} dangerouslySetInnerHTML={{__html:composer.html}}/><div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:16}}><button onClick={()=>setComposer(null)}>Cancelar</button><button disabled={sending} onClick={sendEmail}>{sending?"Enviando...":"Enviar email"}</button></div></div></div>}
  </main>;
}
