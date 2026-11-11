import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { AppShell } from '@/components/app-shell'
import { DocCode, trecho } from '@/components/doc-code'
import graficoFonte from '@/components/grafico.tsx?raw'
import { BlurFade } from '@/components/ui/blur-fade'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { carregarGastos, desvioPadrao, escoreZ, media } from '@/lib/dados'
import dadosFonte from '@/lib/dados.ts?raw'
import { useI18n } from '@/lib/i18n'
import i18nFonte from '@/lib/i18n.tsx?raw'
import magicFonte from '@/lib/magic.ts?raw'
import { cdf } from '@/lib/normal'
import normalFonte from '@/lib/normal.ts?raw'
import setoresFonte from '@/lib/setores.ts?raw'
import xadrezFonte from '@/lib/xadrez.ts?raw'
import problemaFonte from '@/routes/problema.$setor.tsx?raw'

// Os trechos abaixo são recortados dos arquivos REAIS (via "?raw"),
// então a documentação nunca fica diferente do código.
const ARQ = {
  dados: 'src/lib/dados.ts',
  grafico: 'src/components/grafico.tsx',
  i18n: 'src/lib/i18n.tsx',
  magic: 'src/lib/magic.ts',
  xadrez: 'src/lib/xadrez.ts',
  normal: 'src/lib/normal.ts',
  problema: 'src/routes/problema.$setor.tsx',
  setores: 'src/lib/setores.ts',
} as const

const CODIGO_SPLIT = "split(',')"
const ARQUIVO_CAFETERIAS = '01_cafeterias.csv'
const LIMITE_CAFETERIAS = 300
const CASAS_INTEIRO = 0
const CASAS_CURTO = 2
const CASAS_Z = 4
const CASAS_PHI = 3
const CASAS_PROBABILIDADE = 1

const SECOES = [
  { id: 'visao-geral', titulo: 'Visão geral' },
  { id: 'dados', titulo: 'Lendo os dados' },
  { id: 'desvio', titulo: 'Desvio padrão' },
  { id: 'escore-z', titulo: 'Escore Z' },
  { id: 'normal', titulo: 'A curva normal' },
  { id: 'probabilidade', titulo: 'A probabilidade' },
  { id: 'grafico', titulo: 'O gráfico' },
  { id: 'pagina', titulo: 'A página' },
  { id: 'magic', titulo: 'Magic e Scryfall' },
  { id: 'xadrez', titulo: 'Xadrez e FIDE' },
  { id: 'apoio', titulo: 'Setores e idiomas' },
  { id: 'perguntas', titulo: 'Perguntas prováveis' },
] as const

const FLUXO = [
  ['carregarGastos', 'lê o CSV do setor e devolve a lista de gastos.'],
  ['media', 'estima μ, a soma dos gastos dividida por n.'],
  ['desvioPadrao', 'estima σ amostral: √(Σ(x − μ)² / (n − 1)).'],
  ['escoreZ', 'converte o valor digitado em Z = (x − μ) / σ.'],
  ['cdf', 'devolve Φ(Z), a área à esquerda; a chance de gastar mais é 1 − Φ.'],
  ['Grafico', 'desenha o histograma real e a curva normal por cima.'],
] as const

const ARQUIVOS = [
  [ARQ.dados, 'CSV, média, desvio padrão e Z'],
  [ARQ.normal, 'densidade (pdf) e área acumulada (cdf)'],
  [ARQ.grafico, 'histograma + curva em SVG'],
  [ARQ.problema, 'a tela de cada problema'],
  [ARQ.magic, 'cartas de Magic: Z por custo e TLC'],
  [ARQ.xadrez, 'modos de xadrez e modelos de Elo'],
  [ARQ.setores, 'os 5 setores e seus CSVs'],
  [ARQ.i18n, 'textos em português e inglês'],
] as const

const PERGUNTAS: readonly { pergunta: string; resposta: ReactNode }[] = [
  {
    pergunta: 'Por que o desvio padrão divide por n − 1 e não por n?',
    resposta:
      'Porque estamos estimando σ a partir de uma amostra. A média da amostra já "gastou" um grau de liberdade, e dividir por n subestimaria a dispersão. Com n − 1 (correção de Bessel) a estimativa fica sem viés. Com 1200 clientes a diferença é minúscula, mas o correto para amostra é n − 1.',
  },
  {
    pergunta: 'Por que o código não usa uma tabela Z?',
    resposta:
      'A tabela é só um jeito de consultar Φ(z), a área à esquerda de z, e essa função não tem fórmula fechada. O código calcula Φ direto com a aproximação clássica da função erro (Abramowitz & Stegun, erro máximo ≈ 1,5·10⁻⁷). Para z = 2, o resultado é 0,9772, o mesmo valor da tabela.',
  },
  {
    pergunta: 'Os gastos realmente seguem uma distribuição normal?',
    resposta:
      'É uma suposição do problema, não algo que o app prova. Por isso o gráfico põe a curva sobre o histograma, e a última caixa compara a probabilidade do modelo com a fração real de clientes que gastou mais. Quanto mais próximas, melhor a aproximação.',
  },
  {
    pergunta: 'Isso é o Teorema do Limite Central?',
    resposta:
      'Não diretamente. O TLC diz que a média de amostras grandes é aproximadamente normal. Aqui supomos que o gasto de cada cliente já é normal e usamos σ, não o erro padrão σ/√n.',
  },
  {
    pergunta: 'Por que P(X > x) e não P(X = x)?',
    resposta:
      'Em uma variável contínua a probabilidade de um valor exato é zero; só intervalos têm área. Por isso sempre perguntamos "mais que" ou "entre".',
  },
  {
    pergunta: 'Por que 1 − Φ(Z)?',
    resposta:
      'Φ(z) é a área à esquerda de z e a área total é 1. Então a área à direita é o que sobra: P(Z > a) = 1 − Φ(a).',
  },
  {
    pergunta: 'Por que o eixo do gráfico vai de μ − 3,5σ a μ + 3,5σ?',
    resposta:
      'A regra empírica diz que 99,73% da área está em 3σ. Usar 3,5σ cobre praticamente tudo e deixa uma folga visual nas pontas.',
  },
  {
    pergunta: 'Por que as barras são "densidade" e não contagem?',
    resposta:
      'Densidade = clientes na caixa ÷ total ÷ largura da caixa. Assim a área das barras soma 1, exatamente como a área sob a curva normal, e as duas ficam na mesma escala.',
  },
]

const Cod = ({ children }: { children: ReactNode }) => (
  <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">
    {children}
  </code>
)

const Texto = ({ children }: { children: ReactNode }) => (
  <p className="text-muted-foreground leading-relaxed">{children}</p>
)

interface SecaoProps {
  id: string
  titulo: string
  atraso?: number
  children: ReactNode
}

const Secao = ({ id, titulo, atraso = 0, children }: SecaoProps) => (
  <BlurFade delay={atraso} inView>
    <section className="flex scroll-mt-6 flex-col gap-4" id={id}>
      <h2 className="text-2xl font-normal">{titulo}</h2>
      {children}
    </section>
  </BlurFade>
)

interface ContaCafeterias {
  acima: number
  mu: number
  n: number
  phi: number
  probAcima: number
  sigma: number
  soma: number
  somaQuadrados: number
  variancia: number
  z: number
}

// Mesmas funções da tela, para o exemplo não divergir do app.
const contaCafeterias = (gastos: readonly number[]): ContaCafeterias => {
  const n = gastos.length
  let soma = 0
  for (const gasto of gastos) {
    soma += gasto
  }
  const mu = media(gastos)
  let somaQuadrados = 0
  for (const gasto of gastos) {
    somaQuadrados += (gasto - mu) ** 2
  }
  const sigma = desvioPadrao(gastos)
  const phi = cdf(LIMITE_CAFETERIAS, mu, sigma)
  let acima = 0
  for (const gasto of gastos) {
    if (gasto > LIMITE_CAFETERIAS) {
      acima += 1
    }
  }
  return {
    acima,
    mu,
    n,
    phi,
    probAcima: 1 - phi,
    sigma,
    soma,
    somaQuadrados,
    variancia: somaQuadrados / (n - 1),
    z: escoreZ(LIMITE_CAFETERIAS, mu, sigma),
  }
}

interface LinhaDaConta {
  conta: string
  valor: string
}

const ExemploCafeterias = () => {
  const { num } = useI18n()
  const [conta, setConta] = useState<ContaCafeterias | null>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    const baixar = async () => {
      try {
        const gastos = await carregarGastos(ARQUIVO_CAFETERIAS)
        setConta(contaCafeterias(gastos))
      } catch {
        setErro(true)
      }
    }
    baixar()
  }, [])

  if (erro) {
    return (
      <p className="text-muted-foreground text-sm">
        Não foi possível ler {ARQUIVO_CAFETERIAS}.
      </p>
    )
  }

  if (!conta) {
    return (
      <p className="text-muted-foreground text-sm">Carregando o exemplo…</p>
    )
  }

  const linhas: readonly LinhaDaConta[] = [
    { conta: 'n', valor: num(conta.n, CASAS_INTEIRO) },
    { conta: 'Σx', valor: num(conta.soma, CASAS_CURTO) },
    { conta: 'μ = Σx / n', valor: num(conta.mu, CASAS_CURTO) },
    { conta: 'Σ(x − μ)²', valor: num(conta.somaQuadrados, CASAS_CURTO) },
    {
      conta: 'σ² = Σ(x − μ)² / (n − 1)',
      valor: num(conta.variancia, CASAS_CURTO),
    },
    { conta: 'σ', valor: num(conta.sigma, CASAS_CURTO) },
    {
      conta: `Z = (${LIMITE_CAFETERIAS} − μ) / σ`,
      valor: `${num(conta.z, CASAS_CURTO)} (${num(conta.z, CASAS_Z)})`,
    },
    {
      conta: 'Φ(Z), área à esquerda',
      valor: num(conta.phi, CASAS_PHI),
    },
    {
      conta: `P(X > ${LIMITE_CAFETERIAS}) = 1 − Φ(Z)`,
      valor: `${num(conta.probAcima * 100, CASAS_PROBABILIDADE)}%`,
    },
    {
      conta: 'proporção real',
      valor: `${num(conta.acima, CASAS_INTEIRO)}/${num(conta.n, CASAS_INTEIRO)} (${num((conta.acima / conta.n) * 100, CASAS_CURTO)}%)`,
    },
  ]

  return (
    <Card className="border-border relative overflow-hidden rounded-2xl border ring-0">
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          {ARQUIVO_CAFETERIAS}, x = {LIMITE_CAFETERIAS}. μ, σ, Z e Φ saem de{' '}
          <Cod>media</Cod>, <Cod>desvioPadrao</Cod>, <Cod>escoreZ</Cod> e{' '}
          <Cod>cdf</Cod>.
        </p>
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-normal">Conta</th>
                <th className="px-4 py-2 font-normal">Valor</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => (
                <tr key={linha.conta} className="border-border border-t">
                  <td className="px-4 py-2">{linha.conta}</td>
                  <td className="px-4 py-2 tabular-nums">{linha.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground text-sm">
          O modelo dá {num(conta.probAcima * 100, CASAS_PROBABILIDADE)}% e a
          pesquisa dá {num((conta.acima / conta.n) * 100, CASAS_CURTO)}% (
          {num(conta.acima, CASAS_INTEIRO)} de {num(conta.n, CASAS_INTEIRO)}).
        </p>
      </CardContent>
    </Card>
  )
}

const Pergunta = ({
  pergunta,
  resposta,
}: {
  pergunta: string
  resposta: ReactNode
}) => (
  <Collapsible className="border-border group/pergunta rounded-xl border">
    <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left">
      <span>{pergunta}</span>
      <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-data-open/pergunta:rotate-180" />
    </CollapsibleTrigger>
    <CollapsibleContent>
      <p className="text-muted-foreground px-4 pb-4 leading-relaxed">
        {resposta}
      </p>
    </CollapsibleContent>
  </Collapsible>
)

const Documentacao = () => {
  const { t } = useI18n()

  const carregar = trecho(
    dadosFonte,
    'export const carregarColuna',
    "carregarColuna(arquivo, 'gasto_mensal')"
  )
  const mediaCodigo = trecho(dadosFonte, '// Média: soma', '}')
  const desvio = trecho(dadosFonte, '// Desvio padrão amostral', '}')
  const z = trecho(dadosFonte, '// Escore Z', '(x - mu) / sigma')
  const erf = trecho(normalFonte, '// Abramowitz', '}')
  const pdf = trecho(normalFonte, 'export const pdf', '}')
  const cdfCodigo = trecho(normalFonte, 'export const cdf', '0.5 * (1 + erf')
  const entre = trecho(
    normalFonte,
    'export const probabilityBetween',
    'cdf(upper'
  )
  const caixas = trecho(graficoFonte, '// Eixo X', 'const topo')
  const escala = trecho(graficoFonte, '// Converte valores', 'const telaY')
  const area = trecho(graficoFonte, '// Área à direita', 'telaX(xMax)')
  const baixar = trecho(problemaFonte, '// Baixa o CSV', '}, [setor])')
  const calculo = trecho(
    problemaFonte,
    '// 1) Estimamos',
    'const proporcaoReal'
  )
  const custo = trecho(
    magicFonte,
    'export const estatisticasDoCusto',
    '    .slice(0, quantas)'
  )
  const tlc = trecho(magicFonte, '// Teorema do Limite Central', '}')
  const elo = trecho(
    xadrezFonte,
    '// Desvio padrão do desempenho',
    'Math.SQRT2)'
  )
  const setor = trecho(setoresFonte, '// Cada setor', '}')
  const dicionario = trecho(
    i18nFonte,
    'const en: typeof pt',
    'const en: typeof pt'
  )

  return (
    <AppShell docsAtivo titulo={t('docs')}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 p-8">
        <BlurFade>
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-normal">Como o app funciona</h1>
            <Texto>
              Esta página explica o código do app na ordem da conta feita na
              mão: ler os dados, achar a média, achar o desvio padrão, calcular
              Z, consultar Φ(Z) e responder a probabilidade. Os blocos de código
              são lidos dos próprios arquivos do projeto, então sempre refletem
              o que está rodando.
            </Texto>
            <nav aria-label="Nesta página" className="flex flex-wrap gap-2">
              {SECOES.map(({ id, titulo }) => (
                <a
                  key={id}
                  className="border-border text-muted-foreground hover:text-foreground rounded-full border px-3 py-1 text-sm transition-colors"
                  href={`#${id}`}
                >
                  {titulo}
                </a>
              ))}
            </nav>
          </header>
        </BlurFade>

        <Secao id="visao-geral" titulo="Visão geral">
          <Texto>
            Cada problema é um setor (cafeterias, academias…) com um CSV de 1200
            clientes. O app supõe que o gasto mensal é normal, estima a média e
            o desvio padrão dos dados e responde: qual a chance de um cliente
            gastar mais que um valor? O caminho dos dados é este:
          </Texto>
          <ol className="flex flex-col gap-2">
            {FLUXO.map(([nome, descricao], i) => (
              <li key={nome} className="flex gap-3">
                <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">
                  <Cod>{nome}</Cod> {descricao}
                </span>
              </li>
            ))}
          </ol>
          <div className="border-border overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-normal">Arquivo</th>
                  <th className="px-4 py-2 font-normal">O que faz</th>
                </tr>
              </thead>
              <tbody>
                {ARQUIVOS.map(([arquivo, funcao]) => (
                  <tr key={arquivo} className="border-border border-t">
                    <td className="px-4 py-2 font-mono text-xs">{arquivo}</td>
                    <td className="text-muted-foreground px-4 py-2">
                      {funcao}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Secao>

        <Secao id="dados" titulo="Lendo os dados">
          <Texto>
            O CSV fica em <Cod>public/data</Cod>, então o navegador o baixa com{' '}
            <Cod>fetch</Cod>. Só nos interessa a coluna <Cod>gasto_mensal</Cod>:
            achamos a posição dela no cabeçalho e pegamos essa posição em cada
            linha. O arquivo começa com um caractere invisível (BOM) que precisa
            ser removido, senão o nome da primeira coluna não bate.
          </Texto>
          <DocCode
            arquivo={ARQ.dados}
            codigo={carregar.codigo}
            destacar={['replace', 'indexOf']}
            primeiraLinha={carregar.primeiraLinha}
          />
          <Texto>
            Essas contas lidam bem com o formato simples dos nossos CSVs. Ele
            separa por vírgula sem aspas, então o <Cod>{CODIGO_SPLIT}</Cod>{' '}
            basta.
          </Texto>
          <Texto>
            A média μ é a soma dos gastos dividida pela quantidade de clientes.
          </Texto>
          <DocCode
            arquivo={ARQ.dados}
            codigo={mediaCodigo.codigo}
            primeiraLinha={mediaCodigo.primeiraLinha}
          />
        </Secao>

        <Secao id="desvio" titulo="Desvio padrão">
          <Texto>
            O desvio padrão amostral σ é a raiz quadrada da soma dos quadrados
            das distâncias até a média, depois de dividir essa soma por{' '}
            <Cod>n − 1</Cod>: √(Σ(x − μ)² / (n − 1)). O <Cod>n − 1</Cod> entra
            porque σ está sendo estimado de uma amostra.
          </Texto>
          <DocCode
            arquivo={ARQ.dados}
            codigo={desvio.codigo}
            destacar={['- 1)']}
            primeiraLinha={desvio.primeiraLinha}
          />
        </Secao>

        <Secao id="escore-z" titulo="Escore Z">
          <Texto>
            Z diz quantos desvios padrão um valor está acima (+) ou abaixo (−)
            da média: Z = (x − μ) / σ. Padronizar transforma qualquer X ~ N(μ,
            σ²) em Z ~ N(0, 1). É esse Z que se procura na tabela, no passo
            seguinte.
          </Texto>
          <DocCode
            arquivo={ARQ.dados}
            codigo={z.codigo}
            primeiraLinha={z.primeiraLinha}
          />
        </Secao>

        <Secao id="normal" titulo="A curva normal">
          <Texto>
            Com o Z calculado, o passo seguinte é consultar a tabela Z. O que a
            tabela devolve é Φ(Z), a função de distribuição acumulada (cdf): a
            área sob a curva à esquerda de Z.
          </Texto>
          <Texto>
            A altura da curva em cada ponto é outra conta, a densidade (pdf),{' '}
            <Cod>f(x) = 1/(σ√2π) · e^(−½ z²)</Cod>. O <Cod>z</Cod> é o valor já
            padronizado, e a divisão por <Cod>σ√2π</Cod> faz a área total valer
            1. O gráfico usa essa altura; a tabela não.
          </Texto>
          <DocCode
            arquivo={ARQ.normal}
            codigo={pdf.codigo}
            destacar={['Math.exp']}
            primeiraLinha={pdf.primeiraLinha}
          />
          <Texto>
            Φ(z) não tem fórmula fechada, e é por isso que a tabela existe. O
            computador não guarda a tabela: calcula o mesmo valor com a função
            erro (<Cod>erf</Cod>), pela aproximação de Abramowitz e Stegun, e a
            relação Φ(z) = ½(1 + erf(z/√2)).
          </Texto>
          <DocCode
            arquivo={ARQ.normal}
            codigo={erf.codigo}
            primeiraLinha={erf.primeiraLinha}
          />
          <DocCode
            arquivo={ARQ.normal}
            codigo={cdfCodigo.codigo}
            destacar={['erf(']}
            primeiraLinha={cdfCodigo.primeiraLinha}
          />
        </Secao>

        <Secao id="probabilidade" titulo="A probabilidade">
          <Texto>
            A pergunta da tela é a área à direita do valor: P(X &gt; x) = 1 −
            Φ(Z). No código isso é <Cod>1 − cdf(limite, mu, sigma)</Cod>. Logo
            abaixo, o app conta quantos clientes reais gastaram mais que o
            limite e compara essa proporção com a probabilidade do modelo.
          </Texto>
          <DocCode
            arquivo={ARQ.problema}
            codigo={calculo.codigo}
            destacar={['1 - cdf', 'filter']}
            primeiraLinha={calculo.primeiraLinha}
          />
          <Texto>
            Para o caso &ldquo;entre dois valores&rdquo;, Φ(b) − Φ(a), já existe{' '}
            <Cod>probabilityBetween</Cod>, mas ela ainda não está ligada a
            nenhuma tela.
          </Texto>
          <DocCode
            arquivo={ARQ.normal}
            codigo={entre.codigo}
            primeiraLinha={entre.primeiraLinha}
          />
          <Texto>
            A mesma conta, com as cafeterias e x = {LIMITE_CAFETERIAS}. Os
            valores estão arredondados; Z aparece com duas e com quatro casas.
          </Texto>
          <ExemploCafeterias />
        </Secao>

        <Secao id="grafico" titulo="O gráfico">
          <Texto>
            O gráfico é um SVG desenhado à mão, sem biblioteca. Primeiro
            decidimos o intervalo (μ ± 3,5σ, a regra empírica com uma folga),
            dividimos em 24 caixas e contamos quantos clientes caem em cada uma.
            A altura das barras é uma densidade, na mesma escala da curva.
          </Texto>
          <DocCode
            arquivo={ARQ.grafico}
            codigo={caixas.codigo}
            destacar={['densidades =']}
            primeiraLinha={caixas.primeiraLinha}
          />
          <Texto>
            Valores de dados viram posições na tela com duas funções simples:{' '}
            <Cod>telaX</Cod> e <Cod>telaY</Cod>. O eixo Y do SVG cresce para
            baixo, por isso <Cod>telaY</Cod> inverte.
          </Texto>
          <DocCode
            arquivo={ARQ.grafico}
            codigo={escala.codigo}
            primeiraLinha={escala.primeiraLinha}
          />
          <Texto>
            A área colorida é a probabilidade P(X &gt; limite): a mesma curva,
            só que percorrida do limite até a ponta direita e fechada pelo eixo
            X.
          </Texto>
          <DocCode
            arquivo={ARQ.grafico}
            codigo={area.codigo}
            primeiraLinha={area.primeiraLinha}
          />
        </Secao>

        <Secao id="pagina" titulo="A página">
          <Texto>
            Cada problema tem sua rota (<Cod>/problema/$setor</Cod>). O CSV é
            baixado em um <Cod>useEffect</Cod> toda vez que o setor muda; até
            lá, <Cod>gastos</Cod> está vazio e a tela mostra &ldquo;Carregando…
            &rdquo;. O componente recebe <Cod>key={'{setor.id}'}</Cod>, o que
            reinicia o estado (inclusive o valor digitado) ao trocar de setor.
          </Texto>
          <DocCode
            arquivo={ARQ.problema}
            codigo={baixar.codigo}
            primeiraLinha={baixar.primeiraLinha}
          />
          <Texto>
            Os números dos cartões rolam até o novo valor com o{' '}
            <Cod>NumberTicker</Cod> do Magic UI.
          </Texto>
        </Secao>

        <Secao id="magic" titulo="Magic e Scryfall">
          <Texto>
            As páginas de Magic usam as criaturas de papel da Scryfall. O script{' '}
            <Cod>scripts/scryfall.ts</Cod> baixa o arquivo oficial de cartas
            (Oracle Cards), filtra só criaturas com poder e resistência
            numéricos e grava um CSV em <Cod>public/data</Cod>. Rode{' '}
            <Cod>bun scripts/scryfall.ts</Cod> para atualizar. Assim o app lê um
            arquivo local, igual aos outros setores, sem depender da API.
          </Texto>
          <Texto>
            Para saber quem é forte para o custo, calculamos μ e σ da força
            (poder + resistência) só entre as criaturas do mesmo custo de mana,
            e o Z de cada uma. Z &gt; 2 é raro pela regra empírica.
          </Texto>
          <DocCode
            arquivo={ARQ.magic}
            codigo={custo.codigo}
            destacar={['(forca(carta) - mu) / sigma']}
            primeiraLinha={custo.primeiraLinha}
          />
          <Texto>
            O Teorema do Limite Central é demonstrado sorteando <Cod>n</Cod>{' '}
            criaturas, tirando a média e repetindo mil vezes. O histograma
            dessas médias segue uma normal com média μ e desvio{' '}
            <Cod>σ / √n</Cod>, e o desvio simulado aparece ao lado do teórico.
          </Texto>
          <DocCode
            arquivo={ARQ.magic}
            codigo={tlc.codigo}
            destacar={['Math.random']}
            primeiraLinha={tlc.primeiraLinha}
          />
          <Texto>
            O poder é inteiro e tem cauda longa, então a normal é só uma
            aproximação do poder individual. Por isso a conferência com os dados
            reais, e por isso o TLC é tão útil aqui.
          </Texto>
        </Secao>

        <Secao id="xadrez" titulo="Xadrez e FIDE">
          <Texto>
            Os ratings vêm da lista pública da FIDE. <Cod>scripts/fide.ts</Cod>{' '}
            lê o XML (cerca de 860 MB) aos pedaços, fica só com jogadores ativos
            e grava um CSV de um número por linha para cada modo (clássico,
            rápido e blitz). As páginas de modo repetem o fluxo dos setores: μ,
            σ, Z e 1 − Φ. Como a FIDE não dá rating abaixo de 1400, a esquerda
            da distribuição é cortada e a normal é só uma aproximação.
          </Texto>
          <Texto>
            O Duelo de Elo usa a normal de outro jeito. No modelo original, o
            desempenho de cada jogador é normal com σ = 200, e a diferença de
            dois desempenhos independentes tem σ = 200·√2. A pontuação esperada
            é Φ dessa diferença.
          </Texto>
          <DocCode
            arquivo={ARQ.xadrez}
            codigo={elo.codigo}
            destacar={['cdf(']}
            primeiraLinha={elo.primeiraLinha}
          />
        </Secao>

        <Secao id="apoio" titulo="Setores e idiomas">
          <Texto>
            Cada setor é só dados: id, arquivo, valor de exemplo e cor. Para
            adicionar um setor basta uma nova entrada em <Cod>SETORES</Cod> e o
            nome nos dicionários.
          </Texto>
          <DocCode
            arquivo={ARQ.setores}
            codigo={setor.codigo}
            primeiraLinha={setor.primeiraLinha}
          />
          <Texto>
            Os textos ficam em dois dicionários, português e inglês. A anotação
            abaixo faz o TypeScript exigir que o inglês tenha exatamente as
            mesmas chaves do português.
          </Texto>
          <DocCode
            arquivo={ARQ.i18n}
            codigo={dicionario.codigo}
            destacar={['typeof pt']}
            primeiraLinha={dicionario.primeiraLinha}
          />
          <Texto>
            Esta página de documentação está escrita só em português.
          </Texto>
        </Secao>

        <Secao id="perguntas" titulo="Perguntas prováveis">
          <div className="flex flex-col gap-2">
            {PERGUNTAS.map(({ pergunta, resposta }) => (
              <Pergunta
                key={pergunta}
                pergunta={pergunta}
                resposta={resposta}
              />
            ))}
          </div>
        </Secao>
      </div>
    </AppShell>
  )
}

export const Route = createFileRoute('/docs')({ component: Documentacao })
