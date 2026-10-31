import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000'

export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Listen on all network interfaces
        // https: true, // Handled by basicSsl plugin
        port: 5173,
        proxy: {
            '/api': {
                target: apiTarget,
                changeOrigin: true
            },
            '/socket.io': {
                target: apiTarget,
                changeOrigin: true,
                ws: true
            }
        }
    }
})
