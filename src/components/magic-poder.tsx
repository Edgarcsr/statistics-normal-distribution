import { useState } from 'react'

import { Grafico } from '@/components/grafico'
import { Resultado } from '@/components/resultado'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { desvioPadrao, escoreZ, media } from '@/lib/dados'
import { useI18n } from '@/lib/i18n'
import type { Carta } from '@/lib/magic'
import { cdf } from '@/lib/normal'

// Poder é inteiro: o histograma usa barras de largura ~1 (7σ cobre μ ± 3,5σ).
const LARGURA_DO_INTERVALO = 7

// O mesmo problema dos setores, agora com o poder das criaturas.
export const MagicPoder = ({
  cartas,
  cor,
}: {
  cartas: Carta[]
  cor: string
}) => {
  const { num, pct } = useI18n()
  const [limite, setLimite] = useState(4.5)

  const poderes = cartas.map((carta) => carta.poder)
  const mu = media(poderes)
  const sigma = desvioPadrao(poderes)
  const z = escoreZ(limite, mu, sigma)
  const probAcima = 1 - cdf(limite, mu, sigma)
  const proporcaoReal =
    poderes.filter((poder) => poder > limite).length / poderes.length

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Poder (use 4,5 para &ldquo;poder maior ou igual a 5&rdquo;)
        </span>
        <Input
          onChange={(evento) => setLimite(Number(evento.target.value))}
          step={0.5}
          type="number"
          value={limite}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-4">
        <Resultado rotulo="Média (μ)" valor={mu} />
        <Resultado rotulo="Desvio padrão (σ)" valor={sigma} />
        <Resultado rotulo="Escore Z" valor={z} />
        <Resultado
          rotulo={`P(poder > ${limite})`}
          sufixo="%"
          valor={probAcima * 100}
        />
      </div>

      <Card className="border-border rounded-2xl border ring-0">
        <CardContent className="flex flex-col gap-3">
          <span className="text-muted-foreground text-sm">
            Barras: criaturas reais. Linha: curva normal. Área colorida: P(poder
            &gt; {limite}).
          </span>
          <Grafico
            caixas={Math.round(LARGURA_DO_INTERVALO * sigma)}
            cor={cor}
            gastos={poderes}
            limite={limite}
            mu={mu}
            sigma={sigma}
            titulo="Histograma do poder das criaturas com a curva normal"
          />
          <p className="text-muted-foreground">
            Pelo modelo, {pct(probAcima)} das criaturas teriam poder maior que{' '}
            {limite}. Nas {num(cartas.length, 0)} criaturas reais, são{' '}
            {pct(proporcaoReal)}. A diferença existe porque o poder é discreto e
            tem cauda longa, então a normal é só uma aproximação.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
