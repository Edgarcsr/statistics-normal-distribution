import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import react from 'ultracite/oxlint/react'
import tanstack from 'ultracite/oxlint/tanstack'

export default defineConfig({
  env: core.env,
  extends: [core, react, tanstack],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    'src/components/ui/**',
    'src/hooks/**',
    '.claude/**',
  ],
})
