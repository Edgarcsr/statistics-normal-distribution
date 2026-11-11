import { createFileRoute, redirect } from '@tanstack/react-router'

import { MODOS_XADREZ } from '@/lib/xadrez'

// /xadrez abre direto o primeiro modo.
export const Route = createFileRoute('/xadrez/')({
  beforeLoad: () => {
    throw redirect({
      params: { modo: MODOS_XADREZ[0].id },
      to: '/xadrez/$modo',
    })
  },
})
