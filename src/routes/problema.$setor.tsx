import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { AppShell } from '@/components/app-shell'
import { Grafico } from '@/components/grafico'
import { Resultado } from '@/components/resultado'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { carregarGastos, desvioPadrao, escoreZ, media } from '@/lib/dados'
import { useI18n } from '@/lib/i18n'
import { cdf } from '@/lib/normal'
import { buscarSetor } from '@/lib/setores'
import type { Setor } from '@/lib/setores'

// Conteúdo do problema. Recebe o setor e refaz tudo quando ele muda.
const Problema = ({ setor }: { setor: Setor }) => {
  const { num, pct, t } = useI18n()
  const [gastos, setGastos] = useState<number[]>([])
  const [limite, setLimite] = useState<number>(setor.exemplo)

  // Baixa o CSV do setor.
  useEffect(() => {
    const baixar = async () => {
      setGastos(await carregarGastos(setor.arquivo))
    }
    baixar()
  }, [setor])

  // 1) Estimamos μ e σ a partir dos dados.
  const mu = media(gastos)
  const sigma = desvioPadrao(gastos)

  // 2) Padronizamos o valor digitado e usamos a distribuição normal.
  const z = escoreZ(limite, mu, sigma)
  const probAcima = 1 - cdf(limite, mu, sigma)

  // 3) Conferência: que fração dos clientes REAIS gastou mais que o limite?
  const acima = gastos.filter((gasto) => gasto > limite).length
  const proporcaoReal = acima / gastos.length

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-normal">
        {t(setor.id)}: {t('title')}
      </h1>
      <p className="text-muted-foreground">{t('intro')}</p>

      <label className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">{t('valueLabel')}</span>
        <Input
          onChange={(evento) => setLimite(Number(evento.target.value))}
          type="number"
          value={limite}
        />
      </label>

      {gastos.length === 0 ? (
        <p>{t('loading')}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Resultado prefixo="R$ " rotulo={t('mean')} valor={mu} />
            <Resultado prefixo="R$ " rotulo={t('sd')} valor={sigma} />
            <Resultado rotulo={t('zScore')} valor={z} />
            <Resultado
              rotulo={`P(X > ${limite})`}
              sufixo="%"
              valor={probAcima * 100}
            />
          </div>

          <Card className="border-border rounded-2xl border ring-0">
            <CardContent className="flex flex-col gap-3">
              <span className="text-muted-foreground text-sm">
                {t('chartHint')} P(X &gt; {limite}).
              </span>
              <Grafico
                cor={setor.cor}
                gastos={gastos}
                limite={limite}
                mu={mu}
                sigma={sigma}
              />
            </CardContent>
          </Card>

          <Card className="border-border rounded-2xl border ring-0">
            <CardContent className="flex flex-col gap-3">
              <p>
                Z = (x − μ) / σ = ({limite} − {num(mu)}) / {num(sigma)} ={' '}
                <strong>{num(z)}</strong>
              </p>
              <p>
                P(X &gt; {limite}) = 1 − Φ(Z) ={' '}
                <strong>{pct(probAcima)}</strong> {t('modelSuffix')}
              </p>
              <p className="text-muted-foreground">
                {t('surveyBefore')} {acima} {t('surveyOf')} {gastos.length}{' '}
                {t('surveyAfter')} {pct(proporcaoReal)}. {t('surveyNote')}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

const Pagina = () => {
  const { setor: id } = Route.useParams()
  const setor = buscarSetor(id)
  const { t } = useI18n()

  return (
    <AppShell selecionado={setor.id} titulo={t(setor.id)}>
      <Problema key={setor.id} setor={setor} />
    </AppShell>
  )
}

export const Route = createFileRoute('/problema/$setor')({ component: Pagina })
