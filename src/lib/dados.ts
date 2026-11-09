// Lê um CSV da pasta public/data e devolve só a coluna "gasto_mensal".
export const carregarGastos = async (arquivo: string): Promise<number[]> => {
  const resposta = await fetch(`/data/${arquivo}`)
  const texto = await resposta.text()
  const [cabecalho, ...linhas] = texto.trim().split('\n')

  // O arquivo começa com um caractere invisível (BOM); removemos antes de procurar a coluna.
  const colunas = cabecalho.replace('﻿', '').split(',')
  const posicao = colunas.indexOf('gasto_mensal')

  return linhas.map((linha) => Number(linha.split(',')[posicao]))
}

// Média: soma de tudo dividida pela quantidade.
export const media = (valores: number[]): number => {
  let soma = 0
  for (const valor of valores) {
    soma += valor
  }
  return soma / valores.length
}

// Desvio padrão amostral: raiz da média dos quadrados das distâncias até a média.
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
