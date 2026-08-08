# V24 — Página blindada de preparação para entrevista

## Importante
O vídeo atual da primeira página do formulário NÃO foi alterado.
Ele continua sendo o vídeo de instruções para preenchimento do formulário.

## Nova página
Foi criada uma página independente:

/preparacao/[token]

Ela usa validação por CPF + data de nascimento, mas não abre o formulário e não marca o formulário como iniciado.

## Proteções
- Link individual por cliente
- Validação por CPF e data de nascimento
- Marca d'água dinâmica com nome do cliente
- CPF mascarado
- Avisos de uso exclusivo e não compartilhamento
- Bloqueio básico de seleção de texto e botão direito
- Vídeo com controlsList="nodownload"

## Vídeo de entrevista
Quando o vídeo final estiver pronto, adicione na Vercel:

NEXT_PUBLIC_VIDEO_ENTREVISTA=https://link-do-video-final.mp4

Depois faça redeploy.

## Emails 05 e 06
Os emails 05 e 06 agora apontam para a página blindada.
Também foram liberados para envio automático, pois não dependem mais de anexos.

## Supabase
Não precisa rodar SQL novo para esta versão.
