import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), // esto ya estaba (puede verse un poco distinto en tu archivo, dejalo como está)
    VitePWA({
      registerType: 'autoUpdate', // cuando subas cambios, la app se actualiza sola
      manifest: {
        // el "manifest" es la ficha que le dice al celular cómo mostrar la app
        name: 'Pelis',
        short_name: 'Pelis', // el nombre que aparece debajo del ícono
        description: 'Nuestra lista de pelis y series',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone', // abre sin la barra del navegador, como una app
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          // el mismo ícono grande, marcado como "maskable" para que Android lo recorte bien
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
