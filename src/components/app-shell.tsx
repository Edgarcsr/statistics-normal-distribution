import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import { CommandMenu } from '@/components/command-menu'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useI18n } from '@/lib/i18n'

interface AppShellProps {
  // Texto mostrado no topo da página.
  titulo: string
  // id do problema aberto; vazio quando a página não é um problema.
  selecionado?: string
  docsAtivo?: boolean
  // id da seção de Magic aberta; vazio nas outras páginas.
  magicSelecionado?: string
  // id do item de Xadrez aberto (modo ou "duelo").
  xadrezSelecionado?: string
  children: ReactNode
}

// Moldura comum a todas as páginas: sidebar, busca (⌘K) e cabeçalho.
export const AppShell = ({
  titulo,
  selecionado = '',
  docsAtivo = false,
  magicSelecionado = '',
  xadrezSelecionado = '',
  children,
}: AppShellProps) => {
  const [buscaAberta, setBuscaAberta] = useState(false)
  const { t } = useI18n()

  return (
    <SidebarProvider style={{ '--sidebar-width': '17rem' } as CSSProperties}>
      <AppSidebar
        docsAtivo={docsAtivo}
        magicSelecionado={magicSelecionado}
        onSearch={() => setBuscaAberta(true)}
        selecionado={selecionado}
        xadrezSelecionado={xadrezSelecionado}
      />
      <CommandMenu onOpenChange={setBuscaAberta} open={buscaAberta} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger aria-label={t('toggleSidebar')} className="-ml-1" />
          <Separator
            className="mx-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          <span className="text-sm">{titulo}</span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
