import { TanStackDevtools } from '@tanstack/react-devtools'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { TooltipProvider } from '@/components/ui/tooltip'
import { I18nProvider } from '@/lib/i18n'

import '../styles.css'

const RootComponent = () => (
  <>
    <I18nProvider>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </I18nProvider>
    <TanStackDevtools
      config={{
        position: 'bottom-right',
      }}
      plugins={[
        {
          name: 'TanStack Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
      ]}
    />
  </>
)

export const Route = createRootRoute({
  component: RootComponent,
})
