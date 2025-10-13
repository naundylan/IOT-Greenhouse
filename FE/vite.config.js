import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // THÊM ĐOẠN CODE NÀY VÀO
  server: {
    proxy: {
      // Bất kỳ request nào bắt đầu bằng /api sẽ được chuyển tiếp
      '/api': {
        target: 'http://localhost:8100', // Địa chỉ của backend
        changeOrigin: true, // Cần thiết cho virtual hosted sites
        secure: false,      // Nếu backend của bạn dùng http
      }
    }
  }
})
