import { createFileRoute } from '@tanstack/react-router'

import { AppShell } from '@/components/app-shell'
import { XadrezProblema } from '@/components/xadrez-problema'
import { useI18n } from '@/lib/i18n'
import { buscarModoXadrez } from '@/lib/xadrez'

const Pagina = () => {
  const { modo: id } = Route.useParams()
  const modo = buscarModoXadrez(id)
  const { t } = useI18n()

  return (
    <AppShell
      titulo={`${t('xadrez')}: ${t(modo.id)}`}
      xadrezSelecionado={modo.id}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
        <h1 className="text-3xl font-normal">
          {t('xadrez')} {t(modo.id)}: qual a chance de um jogador ter rating
          acima de um valor?
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Supomos que o rating FIDE segue uma distribuição normal. Com a média e
          o desvio padrão dos jogadores ativos, o escore Z diz quantos desvios
          padrão um rating está acima da média, e Φ(Z) vira a posição dele no
          ranking. Dados da lista pública da FIDE; atualize com{' '}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">
            bun scripts/fide.ts
          </code>
          .
        </p>
        <XadrezProblema key={modo.id} modo={modo} />
      </div>
    </AppShell>
  )
}

export const Route = createFileRoute('/xadrez/$modo')({ component: Pagina })
