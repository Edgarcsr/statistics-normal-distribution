import { createFileRoute, redirect } from '@tanstack/react-router'

import { SETORES } from '@/lib/setores'

// A página inicial abre direto o primeiro problema.
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      params: { setor: SETORES[0].id },
      to: '/problema/$setor',
    })
  },
})
