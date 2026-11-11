// Lê um CSV da pasta public/data e devolve só uma coluna, como números.
export const carregarColuna = async (
  arquivo: string,
  coluna: string
): Promise<number[]> => {
  const resposta = await fetch(`${import.meta.env.BASE_URL}data/${arquivo}`)
  const texto = await resposta.text()
  const [cabecalho, ...linhas] = texto.trim().split('\n')

  // O arquivo começa com um caractere invisível (BOM); removemos antes de procurar a coluna.
  const colunas = cabecalho.replace('﻿', '').split(',')
  const posicao = colunas.indexOf(coluna)

  return linhas.map((linha) => Number(linha.split(',')[posicao]))
}

// Os CSVs dos setores guardam o gasto na coluna "gasto_mensal".
export const carregarGastos = (arquivo: string): Promise<number[]> =>
  carregarColuna(arquivo, 'gasto_mensal')

// Média: soma de tudo dividida pela quantidade.
export const media = (valores: number[]): number => {
  let soma = 0
  for (const valor of valores) {
    soma += valor
  }
  return soma / valores.length
}

// Desvio padrão amostral: raiz da soma dos quadrados das distâncias
// até a média, depois de dividir essa soma por n − 1.
export const desvioPadrao = (valores: number[]): number => {
  const mu = media(valores)
  let soma = 0
  for (const valor of valores) {
    soma += (valor - mu) ** 2
  }
  return Math.sqrt(soma / (valores.length - 1))
}

// Escore Z: quantos desvios padrão o valor está acima (+) ou abaixo (−) da média.
export const escoreZ = (x: number, mu: number, sigma: number): number =>
  (x - mu) / sigma
