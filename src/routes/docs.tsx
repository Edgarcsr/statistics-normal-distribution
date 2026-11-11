import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppShell } from '@/components/app-shell'
import { DocCode, trecho } from '@/components/doc-code'
import graficoFonte from '@/components/grafico.tsx?raw'
import { Badge } from '@/components/ui/badge'
import { BlurFade } from '@/components/ui/blur-fade'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { NumberTicker } from '@/components/ui/number-ticker'
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

const SECOES = [
  { id: 'visao-geral', titulo: 'Visão geral' },
  { id: 'dados', titulo: 'Lendo os dados' },
  { id: 'normal', titulo: 'A curva normal' },
  { id: 'escore-z', titulo: 'Escore Z' },
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
  ['media e desvioPadrao', 'estimam μ e σ a partir dessa lista.'],
  ['escoreZ', 'converte o valor digitado em Z = (x − μ) / σ.'],
  ['cdf', 'devolve a área acumulada Φ; a chance de gastar mais é 1 − Φ.'],
  ['Grafico', 'desenha o histograma real e a curva normal por cima.'],
] as const

const ARQUIVOS = [
  [ARQ.dados, 'CSV, média, desvio padrão e Z', 'slides 14–15'],
  [ARQ.normal, 'densidade (pdf) e área acumulada (cdf)', 'slides 7, 15, 20'],
  [ARQ.grafico, 'histograma + curva em SVG', 'slides 7, 10, 13'],
  [ARQ.problema, 'a tela de cada problema', 'slides 14–16'],
  [ARQ.magic, 'cartas de Magic: Z por custo e TLC', 'slides 12, 14, 17–18'],
  [ARQ.xadrez, 'modos de xadrez e modelos de Elo', 'slides 14–15'],
  [ARQ.setores, 'os 5 setores e seus CSVs', '—'],
  [ARQ.i18n, 'textos em português e inglês', '—'],
] as const

const PERGUNTAS: readonly { pergunta: string; resposta: ReactNode }[] = [
  {
    pergunta: 'Por que o desvio padrão divide por n − 1 e não por n?',
    resposta:
      'Porque estamos estimando σ a partir de uma amostra. A média da amostra já "gastou" um grau de liberdade, e dividir por n subestimaria a dispersão. Com n − 1 (correção de Bessel) a estimativa fica sem viés. Com 1200 clientes a diferença é minúscula, mas o correto para amostra é n − 1.',
  },
  {
    pergunta: 'Por que não usar a tabela Z como na aula?',
    resposta:
      'A tabela é só um jeito de consultar Φ(z), que não tem fórmula fechada. O código calcula Φ direto com a aproximação clássica da função erro (Abramowitz & Stegun, erro máximo ≈ 1,5·10⁻⁷). O resultado bate com a tabela: Φ(2) = 0,9772, o mesmo do slide 16.',
  },
  {
    pergunta: 'Os gastos realmente seguem uma distribuição normal?',
    resposta:
      'É uma suposição do problema, não algo que o app prova. Por isso o gráfico põe a curva sobre o histograma, e a última caixa compara a probabilidade do modelo com a fração real de clientes que gastou mais. Quanto mais próximas, melhor a aproximação.',
  },
  {
    pergunta: 'Isso é o Teorema do Limite Central?',
    resposta:
      'Não diretamente. O TLC (slide 17) diz que a média de amostras grandes é aproximadamente normal. Aqui supomos que o gasto de cada cliente já é normal e usamos σ, não o erro padrão σ/√n (slide 18).',
  },
  {
    pergunta: 'Por que P(X > x) e não P(X = x)?',
    resposta:
      'Em uma variável contínua a probabilidade de um valor exato é zero; só intervalos têm área. Por isso sempre perguntamos "mais que" ou "entre".',
  },
  {
    pergunta: 'Por que 1 − Φ(Z)?',
    resposta:
      'Φ(z) é a área à esquerda de z (slide 15) e a área total é 1 (slide 10). Então a área à direita é o que sobra: P(Z > a) = 1 − Φ(a).',
  },
  {
    pergunta: 'Por que o eixo do gráfico vai de μ − 3,5σ a μ + 3,5σ?',
    resposta:
      'A regra empírica (slide 13) diz que 99,73% da área está em 3σ. Usar 3,5σ cobre praticamente tudo e deixa uma folga visual nas pontas.',
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
  // Slides da aula relacionados a esta seção.
  slides?: string
  atraso?: number
  children: ReactNode
}

const Secao = ({ id, titulo, slides, atraso = 0, children }: SecaoProps) => (
  <BlurFade delay={atraso} inView>
    <section className="flex scroll-mt-6 flex-col gap-4" id={id}>
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-normal">{titulo}</h2>
        {slides ? <Badge variant="secondary">{slides}</Badge> : null}
      </div>
      {children}
    </section>
  </BlurFade>
)

// Reproduz o Exemplo 1 da aula (slide 16) usando as funções do próprio app.
const ExemploDaAula = () => {
  const { locale } = useI18n()
  const z = (104 - 100) / 2
  const probAcima = 1 - cdf(104, 100, 2)

  return (
    <Card className="border-border relative overflow-hidden rounded-2xl border ring-0">
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Teste ao vivo, calculado agora com <Cod>cdf</Cod>: peça de 100 mm, σ =
          2 mm, rejeitada acima de 104 mm.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm">Z</span>
            <span className="text-2xl tabular-nums">
              <NumberTicker decimalPlaces={2} locale={locale} value={z} />
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm">Φ(2)</span>
            <span className="text-2xl tabular-nums">
              <NumberTicker
                decimalPlaces={4}
                locale={locale}
                value={cdf(2, 0, 1)}
              />
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm">P(X &gt; 104)</span>
            <span className="text-2xl tabular-nums">
              <NumberTicker
                decimalPlaces={2}
                locale={locale}
                value={probAcima * 100}
              />
              %
            </span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Resultado do slide: 0,9772 e 2,28%.
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

  const carregar = trecho(dadosFonte, 'export const carregarGastos', '}')
  const estatisticas = trecho(
    dadosFonte,
    '// Média: soma',
    'export const desvioPadrao'
  )
  const desvio = trecho(dadosFonte, 'export const desvioPadrao', '}')
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
              Esta página explica o código do app, arquivo por arquivo, ligando
              cada parte ao que foi visto na Aula 09. Os blocos de código são
              lidos dos próprios arquivos do projeto, então sempre refletem o
              que está rodando.
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
                  <th className="px-4 py-2 font-normal">Aula</th>
                </tr>
              </thead>
              <tbody>
                {ARQUIVOS.map(([arquivo, funcao, slides]) => (
                  <tr key={arquivo} className="border-border border-t">
                    <td className="px-4 py-2 font-mono text-xs">{arquivo}</td>
                    <td className="text-muted-foreground px-4 py-2">
                      {funcao}
                    </td>
                    <td className="text-muted-foreground px-4 py-2">
                      {slides}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Secao>

        <Secao id="dados" slides="slides 14–15" titulo="Lendo os dados">
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
            A média é a soma dividida pela quantidade. O desvio padrão é a raiz
            da média dos quadrados das distâncias até a média, com{' '}
            <Cod>n − 1</Cod> no denominador porque σ está sendo estimado de uma
            amostra.
          </Texto>
          <DocCode
            arquivo={ARQ.dados}
            codigo={`${estatisticas.codigo.split('\n').slice(0, -1).join('\n')}\n${desvio.codigo}`}
            destacar={['- 1)']}
            primeiraLinha={estatisticas.primeiraLinha}
          />
          <Texto>
            Essas contas lidam bem com o formato simples dos nossos CSVs. Ele
            separa por vírgula sem aspas, então o <Cod>{CODIGO_SPLIT}</Cod>{' '}
            basta.
          </Texto>
        </Secao>

        <Secao id="normal" slides="slides 7 e 15" titulo="A curva normal">
          <Texto>
            A função de densidade do slide 7,{' '}
            <Cod>f(x) = 1/(σ√2π) · e^(−½ z²)</Cod>, vira três linhas. O{' '}
            <Cod>z</Cod> é o valor já padronizado, e a divisão por{' '}
            <Cod>sd * √2π</Cod> é a constante de normalização que garante área
            total igual a 1.
          </Texto>
          <DocCode
            arquivo={ARQ.normal}
            codigo={pdf.codigo}
            destacar={['Math.exp']}
            primeiraLinha={pdf.primeiraLinha}
          />
          <Texto>
            Já a área acumulada Φ(z) não tem fórmula fechada, e é por isso que
            existe a tabela Z. No código usamos a função erro (<Cod>erf</Cod>),
            calculada por uma aproximação polinomial publicada por Abramowitz e
            Stegun, e a relação Φ(z) = ½(1 + erf(z/√2)).
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
          <ExemploDaAula />
        </Secao>

        <Secao id="escore-z" slides="slide 14" titulo="Escore Z">
          <Texto>
            Z diz quantos desvios padrão um valor está acima (+) ou abaixo (−)
            da média. Padronizar transforma qualquer X ~ N(μ, σ²) em Z ~ N(0,
            1), que é o que a tabela cobre.
          </Texto>
          <DocCode
            arquivo={ARQ.dados}
            codigo={z.codigo}
            primeiraLinha={z.primeiraLinha}
          />
        </Secao>

        <Secao
          id="probabilidade"
          slides="slides 15 e 16"
          titulo="A probabilidade"
        >
          <Texto>
            Com μ e σ estimados, a resposta da tela é{' '}
            <Cod>1 − cdf(limite, mu, sigma)</Cod>, ou seja, 1 − Φ(Z). Logo
            abaixo, o app ainda conta quantos clientes reais gastaram mais que o
            limite, para comparar o modelo com a realidade.
          </Texto>
          <DocCode
            arquivo={ARQ.problema}
            codigo={calculo.codigo}
            destacar={['1 - cdf', 'filter']}
            primeiraLinha={calculo.primeiraLinha}
          />
          <Texto>
            Para o caso &ldquo;entre dois valores&rdquo; (slide 15, Φ(b) − Φ(a))
            já existe <Cod>probabilityBetween</Cod>, mas ela ainda não está
            ligada a nenhuma tela.
          </Texto>
          <DocCode
            arquivo={ARQ.normal}
            codigo={entre.codigo}
            primeiraLinha={entre.primeiraLinha}
          />
        </Secao>

        <Secao id="grafico" slides="slides 7, 10 e 13" titulo="O gráfico">
          <Texto>
            O gráfico é um SVG desenhado à mão, sem biblioteca. Primeiro
            decidimos o intervalo (μ ± 3,5σ, a regra empírica do slide 13 com
            folga), dividimos em 24 caixas e contamos quantos clientes caem em
            cada uma. A altura das barras é uma densidade, na mesma escala da
            curva.
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

        <Secao
          id="magic"
          slides="slides 12, 14, 17 e 18"
          titulo="Magic e Scryfall"
        >
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

        <Secao id="xadrez" slides="slides 14 e 15" titulo="Xadrez e FIDE">
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
