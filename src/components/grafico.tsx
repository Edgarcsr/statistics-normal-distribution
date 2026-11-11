import { useI18n } from '@/lib/i18n'
import { pdf } from '@/lib/normal'

interface GraficoProps {
  gastos: number[]
  mu: number
  cor: string
  sigma: number
  limite: number
  // Texto de acessibilidade do gráfico (padrão: o de gastos).
  titulo?: string
  // Quantidade de barras do histograma.
  caixas?: number
  // false esconde a linha e a área do limite (usado na demonstração do TLC).
  mostrarLimite?: boolean
}

const LARGURA = 700
const ALTURA = 300
// Espaço embaixo para os números do eixo X.
const MARGEM = 30
// Quantidade padrão de barras do histograma.
const CAIXAS_PADRAO = 24
// Quantidade de pontos para desenhar a curva.
const PONTOS = 120

// Histograma dos dados reais + curva normal por cima.
// A área colorida é a probabilidade P(X > limite).
export const Grafico = ({
  gastos,
  mu,
  sigma,
  limite,
  cor,
  titulo,
  caixas: CAIXAS = CAIXAS_PADRAO,
  mostrarLimite = true,
}: GraficoProps) => {
  const { t } = useI18n()

  // Eixo X: de μ − 3,5σ até μ + 3,5σ.
  const xMin = mu - 3.5 * sigma
  const xMax = mu + 3.5 * sigma
  const larguraCaixa = (xMax - xMin) / CAIXAS

  // Conta quantos clientes caem em cada caixa.
  const contagem: number[] = Array.from({ length: CAIXAS }, () => 0)
  for (const gasto of gastos) {
    const posicao = Math.floor((gasto - xMin) / larguraCaixa)
    if (posicao >= 0 && posicao < CAIXAS) {
      contagem[posicao] += 1
    }
  }

  // Densidade = proporção de clientes por unidade de X (mesma escala da curva).
  const densidades = contagem.map((qtd) => qtd / gastos.length / larguraCaixa)
  const topo = Math.max(...densidades, pdf(mu, mu, sigma)) * 1.1

  // Converte valores de dados em posições na tela.
  const telaX = (x: number): number => ((x - xMin) / (xMax - xMin)) * LARGURA
  const telaY = (d: number): number => (ALTURA - MARGEM) * (1 - d / topo)

  // Pontos da curva normal.
  const passo = (xMax - xMin) / PONTOS
  const pontos: string[] = []
  for (let i = 0; i <= PONTOS; i += 1) {
    const x = xMin + i * passo
    pontos.push(`${telaX(x)},${telaY(pdf(x, mu, sigma))}`)
  }
  const curva = pontos.join(' ')

  // Área à direita do limite: a mesma curva, só do limite até o fim.
  const inicio = Math.min(Math.max(limite, xMin), xMax)
  const pontosArea: string[] = [`${telaX(inicio)},${telaY(0)}`]
  for (let i = 0; i <= PONTOS; i += 1) {
    const x = inicio + (i * (xMax - inicio)) / PONTOS
    pontosArea.push(`${telaX(x)},${telaY(pdf(x, mu, sigma))}`)
  }
  pontosArea.push(`${telaX(xMax)},${telaY(0)}`)

  const marcas = [-3, -2, -1, 0, 1, 2, 3]

  return (
    <svg className="w-full" viewBox={`0 0 ${LARGURA} ${ALTURA}`}>
      <title>{titulo ?? t('chartTitle')}</title>

      {densidades.map((d, i) => (
        <rect
          key={xMin + i * larguraCaixa}
          fill="var(--muted-foreground)"
          fillOpacity={0.35}
          height={telaY(0) - telaY(d)}
          width={LARGURA / CAIXAS - 2}
          x={i * (LARGURA / CAIXAS) + 1}
          y={telaY(d)}
        />
      ))}

      {mostrarLimite ? (
        <polygon fill={cor} fillOpacity={0.35} points={pontosArea.join(' ')} />
      ) : null}
      <polyline
        fill="none"
        points={curva}
        stroke="var(--foreground)"
        strokeWidth={2}
      />

      {/* Linha vertical no valor escolhido */}
      {mostrarLimite ? (
        <line
          stroke={cor}
          strokeWidth={2}
          x1={telaX(limite)}
          x2={telaX(limite)}
          y1={0}
          y2={telaY(0)}
        />
      ) : null}

      {marcas.map((k) => (
        <text
          key={k}
          fill="var(--muted-foreground)"
          fontSize={12}
          textAnchor="middle"
          x={telaX(mu + k * sigma)}
          y={ALTURA - 8}
        >
          {Number((mu + k * sigma).toFixed(sigma < 1 ? 1 : 0))}
        </text>
      ))}
    </svg>
  )
}
