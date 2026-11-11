import { defineConfig } from 'oxfmt'
import ultracite from 'ultracite/oxfmt'

export default defineConfig({
  ...ultracite,
  // O gerador do banner não segue o estilo do app.
  ignorePatterns: [...ultracite.ignorePatterns, 'assets/banner/**'],
  semi: false,
  singleQuote: true,
})
