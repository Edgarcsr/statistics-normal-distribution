import { createFileRoute } from '@tanstack/react-router'

import { AppShell } from '@/components/app-shell'
import { XadrezDuelo } from '@/components/xadrez-duelo'
import { useI18n } from '@/lib/i18n'

const Pagina = () => {
  const { t } = useI18n()

  return (
    <AppShell
      titulo={`${t('xadrez')}: ${t('duelo')}`}
      xadrezSelecionado="duelo"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
        <h1 className="text-3xl font-normal">{t('duelo')}</h1>
        <p className="text-muted-foreground leading-relaxed">
          Quanto vale uma diferença de rating? No modelo original de Elo, a
          resposta é uma área da curva normal: padronizamos a diferença e
          consultamos Φ.
        </p>
        <XadrezDuelo />
      </div>
    </AppShell>
  )
}

export const Route = createFileRoute('/xadrez/duelo')({ component: Pagina })
