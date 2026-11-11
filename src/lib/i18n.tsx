import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// Todos os textos do site ficam aqui, um dicionário por idioma.
// Para adicionar um texto: crie a chave em "pt" e em "en".
const pt = {
  platform: 'Plataforma',
  problems: 'Problemas',
  docs: 'Documentação',
  magic: 'Magic',
  poder: 'Poder das criaturas',
  custo: 'Custo de mana',
  tlc: 'Limite central',
  xadrez: 'Xadrez',
  classico: 'Clássico',
  rapido: 'Rápido',
  blitz: 'Blitz',
  duelo: 'Duelo de Elo',
  search: 'Buscar',
  noResults: 'Nada encontrado',
  navigation: 'Navegação',
  toggleSidebar: 'Alternar menu lateral',
  language: 'Idioma',
  loading: 'Carregando...',
  statistics: 'Estatística',
  paletteDescription: 'Busque um problema ou página',
  cafeterias: 'Cafeterias',
  academias: 'Academias',
  streaming: 'Streaming',
  smartphones: 'Smartphones',
  supermercado: 'Supermercado',
  title: 'qual a chance de um cliente gastar mais que um valor?',
  intro:
    'Supomos que o gasto mensal segue uma distribuição normal. Com a média e o desvio padrão da pesquisa, calculamos a probabilidade pelo escore Z (o mesmo valor que se procura na tabela Z).',
  valueLabel: 'Valor de gasto mensal (R$)',
  mean: 'Média (μ)',
  sd: 'Desvio padrão (σ)',
  zScore: 'Escore Z',
  chartHint: 'Barras: clientes reais. Linha: curva normal. Área colorida:',
  chartTitle: 'Histograma dos gastos com a curva normal',
  modelSuffix: '(modelo normal)',
  surveyBefore: 'Na pesquisa,',
  surveyOf: 'de',
  surveyAfter: 'clientes gastaram mais que isso:',
  surveyNote:
    'Quanto mais perto do valor do modelo, melhor a aproximação normal.',
}

const en: typeof pt = {
  platform: 'Platform',
  problems: 'Problems',
  docs: 'Documentation',
  magic: 'Magic',
  poder: 'Creature power',
  custo: 'Mana cost',
  tlc: 'Central limit',
  xadrez: 'Chess',
  classico: 'Classical',
  rapido: 'Rapid',
  blitz: 'Blitz',
  duelo: 'Elo duel',
  search: 'Search',
  noResults: 'No results',
  navigation: 'Navigation',
  toggleSidebar: 'Toggle sidebar',
  language: 'Language',
  loading: 'Loading...',
  statistics: 'Statistics',
  paletteDescription: 'Search for a problem or page',
  cafeterias: 'Coffee shops',
  academias: 'Gyms',
  streaming: 'Streaming',
  smartphones: 'Smartphones',
  supermercado: 'Supermarkets',
  title: 'what is the chance a customer spends more than a given value?',
  intro:
    'We assume monthly spending follows a normal distribution. Using the survey mean and standard deviation, we compute the probability with the Z score (the same value you look up in the Z-table).',
  valueLabel: 'Monthly spending (R$)',
  mean: 'Mean (μ)',
  sd: 'Standard deviation (σ)',
  zScore: 'Z score',
  chartHint: 'Bars: real customers. Line: normal curve. Shaded area:',
  chartTitle: 'Histogram of spending with the normal curve',
  modelSuffix: '(normal model)',
  surveyBefore: 'In the survey,',
  surveyOf: 'of',
  surveyAfter: 'customers spent more than that:',
  surveyNote: 'The closer it is to the model value, the better the fit.',
}

export type TextKey = keyof typeof pt
export type Language = 'pt' | 'en'

const DICIONARIOS = { pt, en } as const
const LOCALES = { pt: 'pt-BR', en: 'en-US' } as const
const STORAGE_KEY = 'idioma'

const lerIdiomaSalvo = (): Language => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'pt'
  } catch {
    return 'pt'
  }
}

interface I18nValue {
  lang: Language
  mudarIdioma: (lang: Language) => void
  // Texto traduzido pela chave.
  t: (key: TextKey) => string
  // Código do idioma para formatar números (ex.: pt-BR).
  locale: string
  // Número formatado (vírgula em português, ponto em inglês).
  num: (valor: number, casas?: number) => string
  // Porcentagem formatada, ex.: 0.1429 → "14,29%".
  pct: (valor: number) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(lerIdiomaSalvo)

  const value = useMemo<I18nValue>(() => {
    const locale = LOCALES[lang]
    return {
      lang,
      locale,
      num: (valor, casas = 2) =>
        valor.toLocaleString(locale, {
          maximumFractionDigits: casas,
          minimumFractionDigits: casas,
        }),
      pct: (valor) =>
        valor.toLocaleString(locale, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
          style: 'percent',
        }),
      mudarIdioma: (novo) => {
        setLang(novo)
        try {
          localStorage.setItem(STORAGE_KEY, novo)
        } catch {
          // sem localStorage, só não lembramos a escolha
        }
      },
      t: (key) => DICIONARIOS[lang][key],
    }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = (): I18nValue => {
  const contexto = useContext(I18nContext)
  if (!contexto) {
    throw new Error('useI18n precisa estar dentro de <I18nProvider>')
  }
  return contexto
}
