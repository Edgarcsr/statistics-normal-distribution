import { Card, CardContent } from '@/components/ui/card'
import { NumberTicker } from '@/components/ui/number-ticker'
import { useI18n } from '@/lib/i18n'

interface ResultadoProps {
  rotulo: string
  valor: number
  prefixo?: string
  sufixo?: string
  casas?: number
}

// Cartão com um número que "rola" até o novo valor quando ele muda.
export const Resultado = ({
  rotulo,
  valor,
  prefixo = '',
  sufixo = '',
  casas = 2,
}: ResultadoProps) => {
  const { locale } = useI18n()
  return (
    <Card className="border-border rounded-2xl border ring-0">
      <CardContent className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">{rotulo}</span>
        <span className="text-2xl tabular-nums">
          {prefixo}
          <NumberTicker decimalPlaces={casas} locale={locale} value={valor} />
          {sufixo}
        </span>
      </CardContent>
    </Card>
  )
}
