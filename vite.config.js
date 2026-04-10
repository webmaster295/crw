import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    viteSingleFile(),
  ],
  build: {
    // ป้องกัน warning เรื่อง chunk size เมื่อรวมทุกอย่างเป็นไฟล์เดียว
    chunkSizeWarningLimit: 10000,
  },
})
