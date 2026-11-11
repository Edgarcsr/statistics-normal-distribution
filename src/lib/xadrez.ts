import { cdf } from '@/lib/normal'

// Cada modo de jogo é um problema: um CSV com o rating FIDE dos jogadores ativos.
export interface ModoXadrez {
  id: 'classico' | 'rapido' | 'blitz'
  arquivo: string
  // rating que já vem preenchido na tela
  exemplo: number
  cor: string
}

// Tons de verde-água, para diferenciar do vermelho de Magic.
export const MODOS_XADREZ: readonly ModoXadrez[] = [
  {
    arquivo: 'xadrez_classico.csv',
    cor: '#2dd4bf',
    exemplo: 2000,
    id: 'classico',
  },
  { arquivo: 'xadrez_rapido.csv', cor: '#14b8a6', exemplo: 2000, id: 'rapido' },
  { arquivo: 'xadrez_blitz.csv', cor: '#0d9488', exemplo: 2000, id: 'blitz' },
]

export const COR_DUELO = '#38bdf8'

export const buscarModoXadrez = (id: string): ModoXadrez =>
  MODOS_XADREZ.find((modo) => modo.id === id) ?? MODOS_XADREZ[0]

// Desvio padrão do desempenho de UM jogador no modelo original de Elo.
const SIGMA_DESEMPENHO = 200

// Elo original: o desempenho de cada jogador numa partida é normal com σ = 200.
// A diferença de dois desempenhos independentes tem σ = 200·√2.
export const esperadoNormal = (diferenca: number): number =>
  cdf(diferenca, 0, SIGMA_DESEMPENHO * Math.SQRT2)

// Fórmula logística, usada por muitos sistemas modernos: 1 / (1 + 10^(−Δ/400)).
export const esperadoLogistico = (diferenca: number): number =>
  1 / (1 + 10 ** (-diferenca / 400))
