import { useState } from 'react'

import { Resultado } from '@/components/resultado'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { estatisticasDoCusto, maisAcimaDaMedia, urlDaImagem } from '@/lib/magic'
import type { Carta } from '@/lib/magic'

const CUSTOS = [1, 2, 3, 4, 5, 6, 7] as const
const QUANTAS = 6
// Regra empírica: 95% dos valores ficam a até 2σ da média.
const LIMITE_Z = 2

// Para cada custo de mana, quais criaturas estão muito acima do padrão?
export const MagicCusto = ({ cartas }: { cartas: Carta[] }) => {
  const { num } = useI18n()
  const [custo, setCusto] = useState<number>(3)

  const estatisticas = estatisticasDoCusto(cartas, custo)
  const destaques = maisAcimaDaMedia(estatisticas, QUANTAS)

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Custo de mana</legend>
        {CUSTOS.map((valor) => (
          <Button
            key={valor}
            aria-pressed={valor === custo}
            onClick={() => setCusto(valor)}
            variant={valor === custo ? 'default' : 'outline'}
          >
            {valor} mana
          </Button>
        ))}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <Resultado
          casas={0}
          rotulo="Criaturas"
          valor={estatisticas.cartas.length}
        />
        <Resultado
          rotulo="Média de poder + resistência"
          valor={estatisticas.mu}
        />
        <Resultado rotulo="Desvio padrão (σ)" valor={estatisticas.sigma} />
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {destaques.map(({ carta, z }) => (
          <li key={carta.nome}>
            <div className="border-border hover:bg-muted/40 rounded-2xl border transition-colors duration-150">
              <div className="flex flex-col gap-3 p-3">
                {/* A Scryfall pede a imagem inteira, sem recorte nem nada por cima. */}
                <img
                  alt={`${carta.nome}, ${carta.poder}/${carta.resistencia}`}
                  className="aspect-[488/680] w-full rounded-[4.75%/3.5%]"
                  height={680}
                  loading="lazy"
                  src={urlDaImagem(carta)}
                  width={488}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl tabular-nums">Z = {num(z)}</span>
                  {z > LIMITE_Z ? (
                    <Badge variant="secondary">acima de 2σ</Badge>
                  ) : null}
                </div>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {carta.poder}/{carta.resistencia} · {carta.raridade}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-muted-foreground text-xs">
        Imagens e dados das cartas: Scryfall. Magic: The Gathering é marca da
        Wizards of the Coast.
      </p>
    </div>
  )
}
