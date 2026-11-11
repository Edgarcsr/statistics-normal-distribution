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
    'src/lib/highlighter.tsx',
    '.claude/**',
  ],
  overrides: [
    {
      // Os "?raw" do Vite importam o texto do arquivo, o lint não enxerga o export.
      files: ['src/routes/docs.tsx'],
      rules: { 'import/default': 'off' },
    },
  ],
})
