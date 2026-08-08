export type TipoFeedback = 'aprovado' | 'negado';

export interface Feedback {
  id: string;
  client_id: string;
  tipo_feedback: TipoFeedback;
  nota_nps: number;
  ponto_forte: string;
  comentario: string;
  autorizou_divulgacao: boolean;
  ip?: string | null;
  user_agent?: string | null;
  created_at: string;
}
