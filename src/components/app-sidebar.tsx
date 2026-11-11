import { Link } from '@tanstack/react-router'
import { BookOpen, Search, Sigma } from 'lucide-react'
import type { ComponentProps } from 'react'

import { SeletorIdioma } from '@/components/seletor-idioma'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useI18n } from '@/lib/i18n'
import { SECOES_MAGIC } from '@/lib/magic-secoes'
import { MODIFIER_KEY_LABEL } from '@/lib/platform'
import { SETORES } from '@/lib/setores'
import { COR_DUELO, MODOS_XADREZ } from '@/lib/xadrez'

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  // id do problema aberto (ex.: "cafeterias")
  selecionado: string
  // true quando a página de documentação está aberta
  docsAtivo?: boolean
  // id da seção de Magic aberta
  magicSelecionado?: string
  xadrezSelecionado?: string
  onSearch: () => void
}

export const AppSidebar = ({
  selecionado,
  docsAtivo = false,
  magicSelecionado = '',
  xadrezSelecionado = '',
  onSearch,
  ...props
}: AppSidebarProps) => {
  const { t } = useI18n()
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12" size="lg">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Sigma className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Bell</span>
                <span className="text-muted-foreground truncate text-xs">
                  {t('statistics')}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('platform')}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={docsAtivo}
                render={<Link to="/docs" />}
                tooltip={t('docs')}
              >
                <BookOpen />
                <span>{t('docs')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarSeparator className="mx-0 mb-2 hidden group-data-[collapsible=icon]:block" />
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {t('problems')}
          </SidebarGroupLabel>
          <SidebarMenu>
            {SETORES.map((setor) => (
              <SidebarMenuItem key={setor.id}>
                <SidebarMenuButton
                  isActive={setor.id === selecionado}
                  render={
                    <Link params={{ setor: setor.id }} to="/problema/$setor" />
                  }
                  tooltip={t(setor.id)}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: setor.cor }}
                    />
                  </span>
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t(setor.id)}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {t('magic')}
          </SidebarGroupLabel>
          <SidebarMenu>
            {SECOES_MAGIC.map((secao) => (
              <SidebarMenuItem key={secao.id}>
                <SidebarMenuButton
                  isActive={secao.id === magicSelecionado}
                  render={
                    <Link params={{ secao: secao.id }} to="/magic/$secao" />
                  }
                  tooltip={t(secao.id)}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: secao.cor }}
                    />
                  </span>
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t(secao.id)}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {t('xadrez')}
          </SidebarGroupLabel>
          <SidebarMenu>
            {MODOS_XADREZ.map((modo) => (
              <SidebarMenuItem key={modo.id}>
                <SidebarMenuButton
                  isActive={modo.id === xadrezSelecionado}
                  render={
                    <Link params={{ modo: modo.id }} to="/xadrez/$modo" />
                  }
                  tooltip={t(modo.id)}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: modo.cor }}
                    />
                  </span>
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t(modo.id)}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={xadrezSelecionado === 'duelo'}
                render={<Link to="/xadrez/duelo" />}
                tooltip={t('duelo')}
              >
                <span className="flex size-4 shrink-0 items-center justify-center">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: COR_DUELO }}
                  />
                </span>
                <span className="group-data-[collapsible=icon]:hidden">
                  {t('duelo')}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSearch} tooltip={t('search')}>
              <Search />
              <span>{t('search')}</span>
              <KbdGroup className="ml-auto">
                <Kbd>{MODIFIER_KEY_LABEL}</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SeletorIdioma />
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
