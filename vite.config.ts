import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sharedApiPlugin } from './server/apiPlugin'

export default defineConfig(({ mode }) => ({
  plugins: [react(), sharedApiPlugin(mode)],
  base: process.env.GITHUB_ACTIONS ? '/nergy.ai/' : '/',
}))
