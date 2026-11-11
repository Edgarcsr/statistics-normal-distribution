// Baixa o "Oracle Cards" da Scryfall e grava só as criaturas em public/data/magic_criaturas.csv.
// Uso: bun scripts/scryfall.ts
// A Scryfall pede User-Agent e Accept nas requisições: https://scryfall.com/docs/api

const CABECALHOS = {
  Accept: 'application/json;q=0.9,*/*;q=0.8',
  'User-Agent': 'statistics-normal-distribution-class-project/1.0',
}
const SAIDA = 'public/data/magic_criaturas.csv'
// Tipos de set que não são cartas "de verdade" (Unfinity, tokens, etc.).
const SETS_IGNORADOS = new Set(['funny', 'memorabilia', 'token'])

interface Face {
  image_uris?: { normal?: string }
  colors?: string[]
  mana_cost?: string
  power?: string
  toughness?: string
  type_line?: string
}

interface Carta extends Face {
  name: string
  cmc: number
  rarity: string
  games: string[]
  set_type: string
  card_faces?: Face[]
  prices?: { usd: string | null }
}

const baixarJson = async <T>(url: string): Promise<T> => {
  const resposta = await fetch(url, { headers: CABECALHOS })
  if (!resposta.ok) {
    throw new Error(`${url} respondeu ${resposta.status}`)
  }
  return (await resposta.json()) as T
}

// A Scryfall entrega um arquivo .jsonl.gz: uma carta (JSON) por linha, comprimido.
const { jsonl_download_uri: url } = await baixarJson<{
  jsonl_download_uri: string
}>('https://api.scryfall.com/bulk-data/oracle_cards')
console.log('Baixando', url)
const resposta = await fetch(url, { headers: CABECALHOS })
if (!resposta.ok) {
  throw new Error(`${url} respondeu ${resposta.status}`)
}
const texto = new TextDecoder().decode(
  Bun.gunzipSync(new Uint8Array(await resposta.arrayBuffer()))
)
const cartas: Carta[] = texto
  .split('\n')
  .filter((linha) => linha.trim() !== '')
  .map((linha) => JSON.parse(linha) as Carta)

const PREFIXO_IMAGEM = 'https://cards.scryfall.io/normal/'
const NUMERO = /^\d+$/u
// Cartas de duas faces guardam poder/resistência dentro da primeira face.
const linhas: string[] = []
for (const carta of cartas) {
  const face = carta.card_faces?.[0] ?? carta
  const poder = carta.power ?? face.power
  const resistencia = carta.toughness ?? face.toughness
  const tipo = carta.type_line ?? face.type_line ?? ''
  const valida =
    tipo.includes('Creature') &&
    carta.games.includes('paper') &&
    !SETS_IGNORADOS.has(carta.set_type) &&
    NUMERO.test(poder ?? '') &&
    NUMERO.test(resistencia ?? '')
  if (valida) {
    const cores = carta.colors ?? face.colors ?? []
    // Só o final do endereço: o começo é sempre o mesmo (cards.scryfall.io/normal/).
    const imagem = (carta.image_uris ?? face.image_uris)?.normal?.replace(
      PREFIXO_IMAGEM,
      ''
    )
    // O nome vai por último porque pode ter vírgula; o resto nunca tem.
    linhas.push(
      [
        carta.cmc,
        poder,
        resistencia,
        cores.join('') || 'C',
        carta.rarity,
        carta.prices?.usd ?? '',
        imagem ?? '',
        carta.name,
      ].join(',')
    )
  }
}

await Bun.write(
  SAIDA,
  `cmc,poder,resistencia,cores,raridade,preco_usd,imagem,nome\n${linhas.join('\n')}\n`
)
console.log(`${linhas.length} criaturas gravadas em ${SAIDA}`)
