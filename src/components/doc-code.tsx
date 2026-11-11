import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from '@/components/ui/code-block'
import { useHighlightedCode } from '@/hooks/use-highlighted-code'

interface Trecho {
  codigo: string
  // Número (no arquivo original) da primeira linha do trecho.
  primeiraLinha: number
}

// Recorta um pedaço do arquivo entre duas linhas, achadas por texto.
// Usar texto em vez de números evita que o trecho "desande" quando o arquivo muda.
export const trecho = (fonte: string, inicio: string, fim: string): Trecho => {
  const linhas = fonte.split('\n')
  const de = linhas.findIndex((linha) => linha.includes(inicio))
  if (de === -1) {
    throw new Error(`Trecho não encontrado: ${inicio}`)
  }
  // fim === '}' quer dizer: a próxima linha que é só uma chave fechando.
  const terminaAqui = (linha: string): boolean =>
    fim === '}' ? linha === '}' : linha.includes(fim)
  const ate = linhas.findIndex(
    (linha, posicao) => posicao >= de && terminaAqui(linha)
  )
  if (ate === -1) {
    throw new Error(`Fim do trecho não encontrado: ${fim}`)
  }
  return {
    codigo: linhas.slice(de, ate + 1).join('\n'),
    primeiraLinha: de + 1,
  }
}

const SEM_DESTAQUE: readonly string[] = []

interface DocCodeProps {
  // Nome do arquivo mostrado no cabeçalho.
  arquivo: string
  codigo: string
  primeiraLinha?: number
  // Linhas que contêm um destes textos ficam realçadas.
  destacar?: readonly string[]
  linguagem?: string
}

// Bloco de código do shadcn com cores (shiki), números de linha e botão de copiar.
export const DocCode = ({
  arquivo,
  codigo,
  primeiraLinha = 1,
  destacar = SEM_DESTAQUE,
  linguagem = 'tsx',
}: DocCodeProps) => {
  const linhas = useHighlightedCode(codigo, linguagem)
  const textoDasLinhas = codigo.replace(/\n$/u, '').split('\n')

  return (
    <CodeBlock className="bg-card">
      <CodeBlockHeader>
        <CodeBlockTitle className="font-mono text-xs">{arquivo}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={codigo} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers startLine={primeiraLinha}>
        {linhas.map((linha, i) => (
          <CodeBlockLine
            key={`${primeiraLinha + i}`}
            variant={
              destacar.some((texto) => textoDasLinhas[i]?.includes(texto))
                ? 'highlighted'
                : 'default'
            }
          >
            {linha}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  )
}
