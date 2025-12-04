import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // 외부 접근 허용
    open: true, // 자동으로 브라우저 열기
    strictPort: false // 포트가 사용 중이면 다른 포트 사용
  }
})

