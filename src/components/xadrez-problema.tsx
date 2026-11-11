import { useEffect, useState } from 'react'

import { Grafico } from '@/components/grafico'
import { Resultado } from '@/components/resultado'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { carregarColuna, desvioPadrao, escoreZ, media } from '@/lib/dados'
import { useI18n } from '@/lib/i18n'
import { cdf } from '@/lib/normal'
import type { ModoXadrez } from '@/lib/xadrez'

// O mesmo problema dos setores, agora com o rating FIDE.
export const XadrezProblema = ({ modo }: { modo: ModoXadrez }) => {
  const { num, pct, t } = useI18n()
  const [ratings, setRatings] = useState<number[]>([])
  const [limite, setLimite] = useState<number>(modo.exemplo)

  useEffect(() => {
    const baixar = async () => {
      setRatings(await carregarColuna(modo.arquivo, 'rating'))
    }
    baixar()
  }, [modo])

  if (ratings.length === 0) {
    return <p>{t('loading')}</p>
  }

  const mu = media(ratings)
  const sigma = desvioPadrao(ratings)
  const z = escoreZ(limite, mu, sigma)
  const probAcima = 1 - cdf(limite, mu, sigma)
  const proporcaoReal =
    ratings.filter((rating) => rating > limite).length / ratings.length
  // Math.min(...lista) estoura a pilha com centenas de milhares de itens.
  let menor = Number.POSITIVE_INFINITY
  for (const rating of ratings) {
    menor = Math.min(menor, rating)
  }

  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Rating FIDE</span>
        <Input
          onChange={(evento) => setLimite(Number(evento.target.value))}
          type="number"
          value={limite}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-4">
        <Resultado casas={0} rotulo="Jogadores" valor={ratings.length} />
        <Resultado rotulo="Média (μ)" valor={mu} />
        <Resultado rotulo="Desvio padrão (σ)" valor={sigma} />
        <Resultado rotulo="Escore Z" valor={z} />
      </div>

      <Card className="border-border rounded-2xl border ring-0">
        <CardContent className="flex flex-col gap-3">
          <span className="text-muted-foreground text-sm">
            Barras: jogadores reais. Linha: curva normal. Área colorida:
            P(rating &gt; {limite}).
          </span>
          <Grafico
            cor={modo.cor}
            gastos={ratings}
            limite={limite}
            mu={mu}
            sigma={sigma}
            titulo="Histograma dos ratings FIDE com a curva normal"
          />
        </CardContent>
      </Card>

      <Card className="border-border rounded-2xl border ring-0">
        <CardContent className="flex flex-col gap-3">
          <p>
            Z = ({limite} − {num(mu)}) / {num(sigma)} ={' '}
            <strong>{num(z)}</strong>
          </p>
          <p>
            P(rating &gt; {limite}) = 1 − Φ(Z) ={' '}
            <strong>{pct(probAcima)}</strong> (modelo normal)
          </p>
          <p className="text-muted-foreground">
            Nos dados reais, {pct(proporcaoReal)} dos {num(ratings.length, 0)}{' '}
            jogadores têm rating acima de {limite}. A diferença existe porque a
            FIDE não dá rating abaixo de {menor}: a esquerda da distribuição é
            cortada e a normal é só uma aproximação.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
