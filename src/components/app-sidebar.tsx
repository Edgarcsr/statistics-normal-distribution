import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  Calculator,
  ChevronRight,
  FlaskConical,
  LayoutGrid,
  Search,
  Sigma,
  Table2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { SeletorIdioma } from '@/components/seletor-idioma'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useI18n } from '@/lib/i18n'
import type { TextKey } from '@/lib/i18n'
import { MODIFIER_KEY_LABEL } from '@/lib/platform'
import { SETORES } from '@/lib/setores'

interface NavItem {
  label: TextKey
  icon: LucideIcon
  active?: boolean
  items?: readonly TextKey[]
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'overview', icon: LayoutGrid, active: true },
  {
    label: 'probability',
    icon: Calculator,
    items: ['betweenTwo', 'tailProb'],
  },
  { label: 'zTable', icon: Table2 },
  {
    label: 'sampling',
    icon: FlaskConical,
    items: ['clt', 'ci'],
  },
  { label: 'reports', icon: BarChart3 },
]

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  // id do problema aberto (ex.: "cafeterias")
  selecionado: string
  onSearch: () => void
}

const NavEntry = ({ label, icon: Icon, active, items }: NavItem) => {
  const { t } = useI18n()
  if (!items) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton isActive={active} tooltip={t(label)}>
          <Icon />
          <span>{t(label)}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible className="group/collapsible" render={<SidebarMenuItem />}>
      <CollapsibleTrigger render={<SidebarMenuButton tooltip={t(label)} />}>
        <Icon />
        <span>{t(label)}</span>
        <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {items.map((item) => (
            <SidebarMenuSubItem key={item}>
              <SidebarMenuSubButton
                render={<button aria-label={t(item)} type="button" />}
              >
                <span>{t(item)}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

export const AppSidebar = ({
  selecionado,
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
            {NAV_ITEMS.map((item) => (
              <NavEntry key={item.label} {...item} />
            ))}
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
