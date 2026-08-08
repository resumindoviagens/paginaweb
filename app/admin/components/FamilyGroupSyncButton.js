"use client";

import { useState } from "react";

export default function FamilyGroupSyncButton({ client }) {
  const [loading, setLoading] = useState(false);

  const isMaster = client?.grupo_familiar_master === true;
  const hasGroup = !!client?.group_process_id;

  async function syncGroup() {
    if (!isMaster) {
      alert("Este cliente ainda não está marcado como Contato principal do grupo. Abra Editar dados e marque essa opção.");
      return;
    }

    if (!hasGroup) {
      alert("Este cliente não possui Grupo de processo. Abra Editar dados e selecione/crie o grupo.");
      return;
    }

    const ok = confirm(
      "Sincronizar etapas, barra de progresso, datas e rastreios deste Contato principal com os demais membros do grupo?\n\nNão serão alterados: nome, CPF, nascimento, e-mail, telefone, respostas do formulário, PDFs ou feedbacks.\n\nO resultado do visto individual também não será sincronizado."
    );

    if (!ok) return;

    setLoading(true);

    try {
      const res = await fetch("/api/admin/sync-family-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterId: client.id })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Não foi possível sincronizar o grupo.");
        return;
      }

      alert(`Grupo sincronizado. ${data.updated || 0} membro(s) atualizado(s).`);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="btn-light"
      onClick={syncGroup}
      disabled={loading || !isMaster || !hasGroup}
      title={!isMaster ? "Marque este cliente como Contato principal do grupo em Editar dados." : !hasGroup ? "Selecione um Grupo de processo em Editar dados." : "Sincronizar etapas, datas e rastreios do grupo"}
    >
      {loading ? "Sincronizando..." : "Sincronizar grupo"}
    </button>
  );
}
