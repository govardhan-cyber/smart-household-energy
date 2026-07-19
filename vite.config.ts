import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['framer-motion', 'lucide-react', 'react-router-dom', 'react', 'react-dom'],
    exclude: ['onnxruntime-web', 'ppu-paddle-ocr']
  },
  build: {
    rolldownOptions: {
      output: {
        minify: {
          compress: {
            dropConsole: true,
          },
        },
      } as any,
    },
  },
})

