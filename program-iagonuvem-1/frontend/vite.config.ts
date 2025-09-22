import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      // Whether to polyfill `global`
      globals: {
        global: true,
        Buffer: true,
        process: true,
      },
      // Whether to polyfill specific globals
      protocolImports: true,
    }),
    react(),
    tailwindcss(),
    viteTsconfigPaths({
      //
      root: resolve(__dirname),
    }),
  ],
  build: {
    rollupOptions: {
      external: [],
      onwarn(warning, warn) {
        // Ignore circular dependency warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        // Ignore polyfill warnings
        if (warning.message.includes('vite-plugin-node-polyfills')) return
        warn(warning)
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    include: ['@solana/web3.js', '@solana/wallet-adapter-base', 'gill'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    },
  },
})
