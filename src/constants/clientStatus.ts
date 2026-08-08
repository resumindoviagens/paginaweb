export const CLIENT_STATUS = [
  'formulario_enviado',
  'ds160_preenchido',
  'taxa_paga',
  'agendamento_confirmado',
  'video_enviado',
  'videochamada_realizada',
  'entrevista_realizada',
  'visto_aprovado',
  'visto_negado',
  'passaporte_devolvido',
] as const;

export type ClientStatus = typeof CLIENT_STATUS[number];

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  formulario_enviado: 'Formulário enviado',
  ds160_preenchido: 'DS-160 preenchido',
  taxa_paga: 'Taxa paga',
  agendamento_confirmado: 'Agendamento confirmado',
  video_enviado: 'Vídeo enviado',
  videochamada_realizada: 'Videochamada realizada',
  entrevista_realizada: 'Entrevista realizada',
  visto_aprovado: 'Visto aprovado',
  visto_negado: 'Visto negado',
  passaporte_devolvido: 'Passaporte devolvido',
};

export const CHECKLIST_POS_AGENDAMENTO = [
  'confirmation_enviado',
  'agendamento_enviado',
  'video_enviado',
  'documentos_orientados',
  'videochamada_realizada',
  'entrevista_realizada',
  'passaporte_devolvido',
] as const;

export type ChecklistPosAgendamento = typeof CHECKLIST_POS_AGENDAMENTO[number];

export const CHECKLIST_POS_AGENDAMENTO_LABELS: Record<ChecklistPosAgendamento, string> = {
  confirmation_enviado: 'Confirmation enviado',
  agendamento_enviado: 'Agendamento enviado',
  video_enviado: 'Vídeo enviado',
  documentos_orientados: 'Documentos orientados',
  videochamada_realizada: 'Videochamada realizada',
  entrevista_realizada: 'Entrevista realizada',
  passaporte_devolvido: 'Passaporte devolvido',
};
