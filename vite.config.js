import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  // 🌟 เพิ่มส่วนนี้เข้าไปเพื่อบังคับให้ Vite รู้จักไลบรารีที่มีปัญหา
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'tslib']
  }
})