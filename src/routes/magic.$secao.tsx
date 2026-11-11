import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { AppShell } from '@/components/app-shell'
import { MagicCusto } from '@/components/magic-custo'
import { MagicPoder } from '@/components/magic-poder'
import { MagicTlc } from '@/components/magic-tlc'
import { useI18n } from '@/lib/i18n'
import { carregarCartas } from '@/lib/magic'
import type { Carta } from '@/lib/magic'
import { buscarSecaoMagic } from '@/lib/magic-secoes'

const Magic = () => {
  const { secao: id } = Route.useParams()
  const secao = buscarSecaoMagic(id)
  const { t } = useI18n()
  const [cartas, setCartas] = useState<Carta[]>([])

  useEffect(() => {
    const baixar = async () => {
      setCartas(await carregarCartas())
    }
    baixar()
  }, [])

  return (
    <AppShell magicSelecionado={secao.id} titulo={t(secao.id)}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
        <h1 className="text-3xl font-normal">{t(secao.id)}</h1>
        <p className="text-muted-foreground leading-relaxed">
          {secao.descricao}
        </p>
        <p className="text-muted-foreground text-sm">
          Dados da Scryfall: criaturas de papel com poder e resistência
          numéricos. Regenere o arquivo com{' '}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">
            bun scripts/scryfall.ts
          </code>
          .
        </p>

        {cartas.length === 0 ? <p>{t('loading')}</p> : null}
        {cartas.length > 0 && secao.id === 'poder' ? (
          <MagicPoder cartas={cartas} cor={secao.cor} />
        ) : null}
        {cartas.length > 0 && secao.id === 'custo' ? (
          <MagicCusto cartas={cartas} />
        ) : null}
        {cartas.length > 0 && secao.id === 'tlc' ? (
          <MagicTlc cartas={cartas} cor={secao.cor} />
        ) : null}
      </div>
    </AppShell>
  )
}

export const Route = createFileRoute('/magic/$secao')({ component: Magic })
