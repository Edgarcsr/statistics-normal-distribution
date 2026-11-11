// Lê a lista pública de jogadores da FIDE e grava um CSV por modo de jogo,
// só com o rating (um número por linha) dos jogadores ativos.
// Uso: bun scripts/fide.ts
// Fonte: https://ratings.fide.com/download_lists.phtml (arquivo ~50 MB, ~860 MB descompactado)
import { tmpdir } from 'node:os'
import path from 'node:path'

const URL_LISTA = 'https://ratings.fide.com/download/players_list_xml.zip'
const ZIP = path.join(tmpdir(), 'fide_players_list.zip')
const SAIDAS = {
  blitz: 'public/data/xadrez_blitz.csv',
  classico: 'public/data/xadrez_classico.csv',
  rapido: 'public/data/xadrez_rapido.csv',
} as const

// Uso: bun scripts/fide.ts [arquivo.xml]
// Sem argumento, baixa a lista (o servidor da FIDE derruba o fetch do Bun, o curl funciona).
// Com um XML já descompactado, só lê esse arquivo.
const xmlLocal: string | undefined = Bun.argv.at(2)
if (!xmlLocal) {
  const baixar = Bun.spawn([
    'curl',
    '--fail',
    '--silent',
    '--show-error',
    '-A',
    'statistics-normal-distribution-class-project/1.0',
    '-o',
    ZIP,
    URL_LISTA,
  ])
  if ((await baixar.exited) !== 0) {
    throw new Error(`Não consegui baixar ${URL_LISTA}`)
  }
  console.log('Lista baixada, lendo jogadores...')
}

const campo = (bloco: string, nome: string): string => {
  const [, valor = ''] =
    new RegExp(`<${nome}>(?<valor>[^<]*)</${nome}>`, 'u').exec(bloco) ?? []
  return valor
}

const JOGADOR = /<player>(?<interior>[\s\S]*?)<\/player>/gu
const ratings: Record<keyof typeof SAIDAS, number[]> = {
  blitz: [],
  classico: [],
  rapido: [],
}

// O XML é grande: lemos aos pedaços e guardamos só a sobra do último pedaço.
const fonte = xmlLocal
  ? Bun.file(xmlLocal).stream()
  : Bun.spawn(['unzip', '-p', ZIP], { stdout: 'pipe' }).stdout
const decodificador = new TextDecoder()
let sobra = ''
for await (const pedaco of fonte) {
  const texto = sobra + decodificador.decode(pedaco, { stream: true })
  let fim = 0
  for (const achado of texto.matchAll(JOGADOR)) {
    const [completo, bloco] = achado
    fim = (achado.index ?? 0) + completo.length
    // flag com "i" = jogador inativo.
    if (!campo(bloco, 'flag').includes('i')) {
      const valores = {
        blitz: Number(campo(bloco, 'blitz_rating')),
        classico: Number(campo(bloco, 'rating')),
        rapido: Number(campo(bloco, 'rapid_rating')),
      }
      for (const modo of Object.keys(SAIDAS) as (keyof typeof SAIDAS)[]) {
        if (valores[modo] > 0) {
          ratings[modo].push(valores[modo])
        }
      }
    }
  }
  sobra = texto.slice(fim)
}

await Promise.all(
  (Object.keys(SAIDAS) as (keyof typeof SAIDAS)[]).map(async (modo) => {
    await Bun.write(SAIDAS[modo], `rating\n${ratings[modo].join('\n')}\n`)
    console.log(`${modo}: ${ratings[modo].length} jogadores em ${SAIDAS[modo]}`)
  })
)
