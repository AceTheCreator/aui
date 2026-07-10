import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// Touched after every completed (re)build. The playground dev server reloads
// off this marker instead of dist/, which is emptied mid-rebuild — see
// packages/playground/DEVELOPMENT.md.
function buildCompleteMarker(): Plugin {
  const marker = fileURLToPath(new URL('./.build-complete', import.meta.url))
  return {
    name: 'build-complete-marker',
    closeBundle() {
      writeFileSync(marker, String(Date.now()))
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], tsconfigPath: './tsconfig.app.json' }),
    buildCompleteMarker(),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'aui',
      formats: ['es', 'cjs'],
      fileName: (format) => `aui.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
