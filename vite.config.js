import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/ward/": {
        target: "https://backend.udyamikutumba.com",
        // target: "http://192.168.0.70:3000",
        changeOrigin: true,
      },
    },
  },
});