import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/ota-fee-calculator/' : '/',
  test: { include: ['src/**/*.test.ts'] },
})
