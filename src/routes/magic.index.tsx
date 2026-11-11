import { createFileRoute, redirect } from '@tanstack/react-router'

import { SECOES_MAGIC } from '@/lib/magic-secoes'

// /magic abre direto a primeira seção.
export const Route = createFileRoute('/magic/')({
  beforeLoad: () => {
    throw redirect({
      params: { secao: SECOES_MAGIC[0].id },
      to: '/magic/$secao',
    })
  },
})
