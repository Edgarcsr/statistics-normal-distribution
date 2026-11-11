// Cada seção de Magic é uma página, como cada setor é uma página de "Problemas".
// As cores tendem ao vermelho, a cor de Magic no app.
export interface SecaoMagic {
  id: 'poder' | 'custo' | 'tlc'
  cor: string
  descricao: string
}

export const SECOES_MAGIC: readonly SecaoMagic[] = [
  {
    cor: '#ef4444',
    descricao:
      'O mesmo problema dos setores: com a média e o desvio padrão do poder, qual a chance de uma criatura ter poder acima de um valor?',
    id: 'poder',
  },
  {
    cor: '#f97316',
    descricao:
      'Dentro de cada custo de mana, o escore Z mostra quantos desvios padrão uma criatura (poder + resistência) está acima da média do seu custo. Z maior que 2 é raro pela regra empírica. Só poder e resistência entram na conta, não as habilidades da carta.',
    id: 'custo',
  },
  {
    cor: '#e11d48',
    descricao:
      'O poder individual não é normal, mas a média de várias criaturas sorteadas é. Aumente n e veja o histograma se ajustar à curva e o desvio encolher.',
    id: 'tlc',
  },
]

export const buscarSecaoMagic = (id: string): SecaoMagic =>
  SECOES_MAGIC.find((secao) => secao.id === id) ?? SECOES_MAGIC[0]
