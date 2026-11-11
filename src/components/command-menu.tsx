import { useNavigate } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { useEffect } from 'react'

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
import { SECOES_MAGIC } from '@/lib/magic-secoes'
import { SETORES } from '@/lib/setores'
import { COR_DUELO, MODOS_XADREZ } from '@/lib/xadrez'

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
            <CommandItem
              onSelect={() => {
                navigate({ to: '/docs' })
                onOpenChange(false)
              }}
            >
              <BookOpen />
              {t('docs')}
            </CommandItem>
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
          <CommandGroup heading={t('magic')}>
            {SECOES_MAGIC.map((secao) => (
              <CommandItem
                key={secao.id}
                onSelect={() => {
                  navigate({
                    params: { secao: secao.id },
                    to: '/magic/$secao',
                  })
                  onOpenChange(false)
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: secao.cor }}
                />
                {t(secao.id)}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t('xadrez')}>
            {MODOS_XADREZ.map((modo) => (
              <CommandItem
                key={modo.id}
                onSelect={() => {
                  navigate({ params: { modo: modo.id }, to: '/xadrez/$modo' })
                  onOpenChange(false)
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: modo.cor }}
                />
                {t(modo.id)}
              </CommandItem>
            ))}
            <CommandItem
              onSelect={() => {
                navigate({ to: '/xadrez/duelo' })
                onOpenChange(false)
              }}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: COR_DUELO }}
              />
              {t('duelo')}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
