import solid from '@solidjs/vite-plugin';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    stylex.vite({
      devMode: 'full',
      useCSSLayers: true,
    }),
    solid(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  build: {
    target: 'es2022',
  },
});
