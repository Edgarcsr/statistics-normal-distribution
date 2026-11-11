import { desvioPadrao, media } from '@/lib/dados'

export interface Carta {
  nome: string
  cmc: number
  poder: number
  resistencia: number
  // Letras das cores: W, U, B, R, G (ou C para incolor).
  cores: string
  raridade: string
  // Preço em dólares; null quando a Scryfall não tem preço.
  preco: number | null
  // Imagem da carta na Scryfall (veja urlDaImagem).
  imagem: string
}

// Lê public/data/magic_criaturas.csv (gerado por scripts/scryfall.ts).
// Endereço completo da imagem (o CSV guarda só o final, para ficar menor).
export const urlDaImagem = (carta: Carta): string =>
  `https://cards.scryfall.io/normal/${carta.imagem}`

// O nome fica na última coluna porque pode ter vírgula; as outras nunca têm.
export const carregarCartas = async (): Promise<Carta[]> => {
  const resposta = await fetch(
    `${import.meta.env.BASE_URL}data/magic_criaturas.csv`
  )
  const texto = await resposta.text()
  const [, ...linhas] = texto.trim().split('\n')

  return linhas.map((linha) => {
    const [cmc, poder, resistencia, cores, raridade, preco, imagem, ...resto] =
      linha.split(',')
    return {
      cmc: Number(cmc),
      cores,
      imagem,
      nome: resto.join(','),
      poder: Number(poder),
      preco: preco === '' ? null : Number(preco),
      raridade,
      resistencia: Number(resistencia),
    }
  })
}

// "Força" de uma criatura: poder + resistência.
export const forca = (carta: Carta): number => carta.poder + carta.resistencia

export interface EstatisticasDoCusto {
  cartas: Carta[]
  mu: number
  sigma: number
}

// Média e desvio padrão da força entre as criaturas de um mesmo custo de mana.
export const estatisticasDoCusto = (
  cartas: Carta[],
  cmc: number
): EstatisticasDoCusto => {
  const doCusto = cartas.filter((carta) => carta.cmc === cmc)
  const forcas = doCusto.map(forca)
  return { cartas: doCusto, mu: media(forcas), sigma: desvioPadrao(forcas) }
}

export interface CartaComZ {
  carta: Carta
  z: number
}

// As cartas mais acima da média do seu custo, com o escore Z de cada uma.
export const maisAcimaDaMedia = (
  { cartas, mu, sigma }: EstatisticasDoCusto,
  quantas: number
): CartaComZ[] =>
  cartas
    .map((carta) => ({ carta, z: (forca(carta) - mu) / sigma }))
    .toSorted((a, b) => b.z - a.z)
    .slice(0, quantas)

// Teorema do Limite Central na prática: sorteia `n` valores (com reposição),
// tira a média, e repete `repeticoes` vezes. Devolve as médias.
export const amostrasDeMedias = (
  valores: number[],
  n: number,
  repeticoes: number
): number[] => {
  const medias: number[] = []
  for (let r = 0; r < repeticoes; r += 1) {
    let soma = 0
    for (let i = 0; i < n; i += 1) {
      soma += valores[Math.floor(Math.random() * valores.length)]
    }
    medias.push(soma / n)
  }
  return medias
}
