import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { NAV_ITEMS } from '@/components/app-sidebar'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useI18n } from '@/lib/i18n'
import { SETORES } from '@/lib/setores'

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CommandMenu = ({ open, onOpenChange }: CommandMenuProps) => {
  const navigate = useNavigate()
  const { t } = useI18n()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  return (
    <CommandDialog
      className="sm:max-w-xl"
      description={t('paletteDescription')}
      onOpenChange={onOpenChange}
      open={open}
      title={t('search')}
    >
      <Command>
        <CommandInput placeholder={t('search')} />
        <CommandList className="max-h-96">
          <CommandEmpty>{t('noResults')}</CommandEmpty>
          <CommandGroup heading={t('navigation')}>
            {NAV_ITEMS.map(({ label, icon: Icon }) => (
              <CommandItem key={label} onSelect={() => onOpenChange(false)}>
                <Icon />
                {t(label)}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t('problems')}>
            {SETORES.map((setor) => (
              <CommandItem
                key={setor.id}
                onSelect={() => {
                  navigate({
                    params: { setor: setor.id },
                    to: '/problema/$setor',
                  })
                  onOpenChange(false)
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: setor.cor }}
                />
                {t(setor.id)}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
