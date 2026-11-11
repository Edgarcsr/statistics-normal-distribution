import { useState } from 'react'

import { Resultado } from '@/components/resultado'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { COR_DUELO, esperadoLogistico, esperadoNormal } from '@/lib/xadrez'

const LARGURA = 700
const ALTURA = 280
const MARGEM = 28
const ALCANCE = 800
const PONTOS = 160
const MARCAS = [-800, -400, 0, 400, 800] as const

const telaX = (diferenca: number): number =>
  ((diferenca + ALCANCE) / (2 * ALCANCE)) * LARGURA
const telaY = (esperado: number): number => (ALTURA - MARGEM) * (1 - esperado)

const caminho = (esperado: (diferenca: number) => number): string => {
  const pontos: string[] = []
  for (let i = 0; i <= PONTOS; i += 1) {
    const diferenca = -ALCANCE + (i * 2 * ALCANCE) / PONTOS
    pontos.push(`${telaX(diferenca)},${telaY(esperado(diferenca))}`)
  }
  return pontos.join(' ')
}

// Pontuação esperada de A contra B pelos dois modelos.
export const XadrezDuelo = () => {
  const [ratingA, setRatingA] = useState(1800)
  const [ratingB, setRatingB] = useState(1600)

  const diferenca = ratingA - ratingB
  const marcador = Math.min(Math.max(diferenca, -ALCANCE), ALCANCE)
  const normal = esperadoNormal(diferenca)
  const logistico = esperadoLogistico(diferenca)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm">Rating de A</span>
          <Input
            onChange={(evento) => setRatingA(Number(evento.target.value))}
            type="number"
            value={ratingA}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm">Rating de B</span>
          <Input
            onChange={(evento) => setRatingB(Number(evento.target.value))}
            type="number"
            value={ratingB}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Resultado casas={0} rotulo="Diferença (A − B)" valor={diferenca} />
        <Resultado
          rotulo="A marca, modelo normal"
          sufixo="%"
          valor={normal * 100}
        />
        <Resultado
          rotulo="A marca, modelo logístico"
          sufixo="%"
          valor={logistico * 100}
        />
      </div>

      <Card className="border-border rounded-2xl border ring-0">
        <CardContent className="flex flex-col gap-3">
          <span className="text-muted-foreground text-sm">
            Pontuação esperada de A (vitória = 1, empate = 0,5) conforme a
            diferença de rating. Linha cheia: normal. Tracejada: logística.
          </span>
          <svg className="w-full" viewBox={`0 0 ${LARGURA} ${ALTURA}`}>
            <title>Pontuação esperada pelos modelos normal e logístico</title>
            <line
              stroke="var(--border)"
              x1={0}
              x2={LARGURA}
              y1={telaY(0.5)}
              y2={telaY(0.5)}
            />
            <polyline
              fill="none"
              points={caminho(esperadoNormal)}
              stroke={COR_DUELO}
              strokeWidth={2}
            />
            <polyline
              fill="none"
              points={caminho(esperadoLogistico)}
              stroke="var(--foreground)"
              strokeDasharray="6 4"
              strokeWidth={2}
            />
            <line
              stroke={COR_DUELO}
              strokeOpacity={0.6}
              x1={telaX(marcador)}
              x2={telaX(marcador)}
              y1={0}
              y2={telaY(0)}
            />
            {MARCAS.map((valor) => (
              <text
                key={valor}
                fill="var(--muted-foreground)"
                fontSize={12}
                textAnchor="middle"
                x={telaX(valor)}
                y={ALTURA - 8}
              >
                {valor}
              </text>
            ))}
          </svg>
        </CardContent>
      </Card>

      <Card className="border-border rounded-2xl border ring-0">
        <CardContent className="flex flex-col gap-3">
          <p>
            Modelo normal: Φ(Δ / (200·√2)) = Φ({diferenca} / 282,84) ={' '}
            <strong>{(normal * 100).toFixed(2).replace('.', ',')}%</strong>
          </p>
          <p>
            Modelo logístico: 1 / (1 + 10^(−Δ/400)) ={' '}
            <strong>{(logistico * 100).toFixed(2).replace('.', ',')}%</strong>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Elo propôs que o desempenho de cada jogador numa partida é normal
            com σ = 200. A diferença de dois desempenhos independentes também é
            normal, com σ = 200·√2 (a variância soma), e a pontuação esperada é
            a área acumulada Φ. A fórmula logística, usada por muitos sistemas
            modernos, dá valores muito parecidos perto da diferença zero e se
            afasta um pouco nas pontas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
