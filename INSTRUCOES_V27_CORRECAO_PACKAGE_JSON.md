# V27 — Correção definitiva de package.json e vercel.json

O erro da Vercel dizia:

/vercel/path0/package.json: Unexpected token "#"

Isso significa que o arquivo package.json tinha texto fora do formato JSON.

Nesta versão:
- package.json foi refeito como JSON puro
- vercel.json foi refeito como JSON puro
- dependências continuam travadas
- Node 20.x mantido
- domínio próprio não foi removido
- vercel.app continua coexistindo

Não cole instruções, comentários ou textos que comecem com # dentro do package.json.

Supabase: não precisa rodar SQL novo.
