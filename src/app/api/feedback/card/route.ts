import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: 'Card de postagem solicitado. Implementar geração de PNG a partir do componente FeedbackPostCard.',
  });
}
