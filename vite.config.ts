import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/seat-in-omni/',
  plugins: [react()],
})
