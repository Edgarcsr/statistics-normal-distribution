// Cada setor é um problema: um CSV com 1200 clientes.
// "exemplo" é o valor de gasto que já vem preenchido na tela.
// "cor" aparece na bolinha da sidebar e no gráfico.
export interface Setor {
  id: 'cafeterias' | 'academias' | 'streaming' | 'smartphones' | 'supermercado'
  arquivo: string
  exemplo: number
  cor: string
}

export const SETORES: readonly Setor[] = [
  {
    id: 'cafeterias',
    arquivo: '01_cafeterias.csv',
    exemplo: 300,
    cor: '#f2b441',
  },
  {
    id: 'academias',
    arquivo: '02_academias.csv',
    exemplo: 300,
    cor: '#4ade80',
  },
  {
    id: 'streaming',
    arquivo: '03_streaming.csv',
    exemplo: 200,
    cor: '#f472b6',
  },
  {
    id: 'smartphones',
    arquivo: '06_smartphones.csv',
    exemplo: 800,
    cor: '#60a5fa',
  },
  {
    id: 'supermercado',
    arquivo: '07_supermercado.csv',
    exemplo: 600,
    cor: '#a78bfa',
  },
]

export const buscarSetor = (id: string): Setor =>
  SETORES.find((setor) => setor.id === id) ?? SETORES[0]
