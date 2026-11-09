import { Languages } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useI18n } from '@/lib/i18n'
import type { Language } from '@/lib/i18n'

const NOMES: Record<Language, string> = {
  en: 'English',
  pt: 'Português',
}
const IDIOMAS: readonly Language[] = ['pt', 'en']

// Item da sidebar que abre um menu com os idiomas disponíveis.
export const SeletorIdioma = () => {
  const { lang, mudarIdioma, t } = useI18n()

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<SidebarMenuButton tooltip={t('language')} />}
        >
          <Languages />
          <span>{NOMES[lang]}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right">
          <DropdownMenuRadioGroup
            onValueChange={(valor) => mudarIdioma(valor as Language)}
            value={lang}
          >
            {IDIOMAS.map((id) => (
              <DropdownMenuRadioItem key={id} value={id}>
                {NOMES[id]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
