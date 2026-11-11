import { useMemo, useState } from 'react'

import { Grafico } from '@/components/grafico'
import { Resultado } from '@/components/resultado'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { desvioPadrao, media } from '@/lib/dados'
import { amostrasDeMedias } from '@/lib/magic'
import type { Carta } from '@/lib/magic'

const TAMANHOS = [1, 2, 5, 30] as const
const REPETICOES = 1000
const BARRAS_MAXIMAS = 24
const LARGURA_DO_INTERVALO = 7

// Teorema do Limite Central (slide 17): as MÉDIAS de amostras formam um sino,
// mesmo que o poder individual seja torto. O erro padrão é σ/√n (slide 18).
export const MagicTlc = ({ cartas, cor }: { cartas: Carta[]; cor: string }) => {
  const [n, setN] = useState<number>(5)
  const [rodada, setRodada] = useState(0)

  const poderes = useMemo(() => cartas.map((carta) => carta.poder), [cartas])
  const mu = media(poderes)
  const sigma = desvioPadrao(poderes)
  const erroPadrao = sigma / Math.sqrt(n)

  // "rodada" só existe para sortear de novo ao clicar no botão.
  const medias = useMemo(
    () => (rodada >= 0 ? amostrasDeMedias(poderes, n, REPETICOES) : []),
    [poderes, n, rodada]
  )

  // A média de n inteiros só assume múltiplos de 1/n. Se cada barra cobrir um número
  // inteiro de múltiplos de 1/n, o histograma não fica "serrilhado".
  const larguraBarra =
    Math.max(
      1,
      Math.ceil(((LARGURA_DO_INTERVALO * erroPadrao) / BARRAS_MAXIMAS) * n)
    ) / n
  const caixas = Math.max(
    1,
    Math.round((LARGURA_DO_INTERVALO * erroPadrao) / larguraBarra)
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Tamanho da amostra</legend>
          {TAMANHOS.map((valor) => (
            <Button
              key={valor}
              aria-pressed={valor === n}
              onClick={() => setN(valor)}
              variant={valor === n ? 'default' : 'outline'}
            >
              n = {valor}
            </Button>
          ))}
        </fieldset>
        <Button onClick={() => setRodada((atual) => atual + 1)} variant="ghost">
          Sortear de novo
        </Button>
      </div>

      <Card className="border-border rounded-2xl border ring-0">
        <CardContent className="flex flex-col gap-3">
          <span className="text-muted-foreground text-sm">
            Barras: {REPETICOES} médias de {n} criaturas sorteadas. Linha: a
            normal que o TLC prevê, com média μ e desvio σ/√n.
          </span>
          <Grafico
            caixas={caixas}
            cor={cor}
            gastos={medias}
            limite={mu}
            mostrarLimite={false}
            mu={mu}
            sigma={erroPadrao}
            titulo="Histograma das médias amostrais com a curva normal prevista"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Resultado rotulo="Média das médias" valor={media(medias)} />
        <Resultado
          rotulo="σ das médias (simulado)"
          valor={desvioPadrao(medias)}
        />
        <Resultado rotulo="σ / √n (teórico)" valor={erroPadrao} />
      </div>
    </div>
  )
}
