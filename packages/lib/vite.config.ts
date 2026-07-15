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
      name: 'apiuikit',
      formats: ['es', 'cjs'],
      fileName: (format) => `apiuikit.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        // Pinned so the filename matches package.json's exports["./style.css"]
        // regardless of the package name — Vite otherwise derives the CSS
        // asset name from package.json.name, which silently breaks that path
        // on a rename.
        assetFileNames: (assetInfo) =>
          assetInfo.names?.[0]?.endsWith('.css') ? 'apiuikit.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
})
