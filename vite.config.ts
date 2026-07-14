import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { analyzeApiPlugin } from './server/analyzePlugin'

export default defineConfig(({ mode }) => ({
  plugins: [react(), analyzeApiPlugin(mode)],
  base: process.env.GITHUB_ACTIONS ? '/nergy.ai/' : '/',
}))
