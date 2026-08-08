import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { feedbackUrl, gerarTokenPesquisa } from '@/lib/feedback';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const clientId = body.clientId;

  if (!clientId) {
    return NextResponse.json({ error: 'clientId obrigatório' }, { status: 400 });
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, nome, email, etapa_atual, data_final_processo, feedback_token')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
  }

  const encerrado = client.etapa_atual === 'passaporte_devolvido' || !!client.data_final_processo;

  if (!encerrado) {
    return NextResponse.json({
      error: 'A pesquisa só pode ser liberada após marcar Passaporte recebido / encerramento.'
    }, { status: 403 });
  }

  const token = client.feedback_token || gerarTokenPesquisa();
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  const { error: updateError } = await supabase
    .from('clients')
    .update({
      feedback_liberado: true,
      feedback_token: token,
      feedback_token_expires_at: expires.toISOString(),
    })
    .eq('id', clientId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('client_logs').insert({
    client_id: clientId,
    action: 'pesquisa_satisfacao_liberada',
    details: 'Pesquisa de satisfação liberada e link gerado.',
  });

  return NextResponse.json({
    ok: true,
    link: feedbackUrl(token),
    token,
  });
}
