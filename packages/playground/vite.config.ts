import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

const auiMarker = fileURLToPath(new URL('../aui/.build-complete', import.meta.url))

// The aui watch build empties dist/ for a few seconds on every rebuild, so
// reloading off dist file events lands mid-build on missing files (blank
// screen). Reload only when the library signals a completed build via its
// marker file — see DEVELOPMENT.md.
function auiRebuildReload(): Plugin {
  return {
    name: 'aui-rebuild-reload',
    apply: 'serve',
    configureServer(server) {
      fs.watchFile(auiMarker, { interval: 200 }, (curr) => {
        if (curr.mtimeMs === 0) return // marker missing — no completed build yet
        server.moduleGraph.invalidateAll()
        server.ws.send({ type: 'full-reload' })
      })
      server.httpServer?.once('close', () => fs.unwatchFile(auiMarker))
    },
  }
}

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // Library build: everything a consumer's own node_modules can provide stays
    // external — bundling aui or CodeMirror would ship duplicate copies
    // (@codemirror/state breaks outright when duplicated). @asyncapi/parser is
    // only reached through aui's dynamic import, so no parser code (and none of
    // its process.env references) lands in this bundle.
    return {
      plugins: [
        react(),
        dts({ include: ['src'], exclude: ['src/main.tsx', 'src/App.tsx'], tsconfigPath: './tsconfig.json' }),
      ],
      build: {
        lib: {
          entry: 'src/index.ts',
          name: 'playground',
          formats: ['es', 'cjs'] as const,
          fileName: (format: string) => `playground.${format}.js`,
        },
        rollupOptions: {
          // The aui pattern must be a regex: a plain 'aui' string would not
          // externalize the 'aui/style.css' subpath import.
          external: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            /^aui(\/|$)/,
            /^@codemirror\//,
            /^@uiw\//,
            /^@asyncapi\//,
          ],
        },
      },
    }
  }

  // Dev server + standalone demo app build.
  return {
    plugins: [react(), auiRebuildReload()],
    server: {
      watch: {
        // dist/ churns while the library rebuilds; the marker plugin above owns reloads.
        ignored: ['**/packages/aui/dist/**'],
      },
    },
    build: {
      // dist/ is reserved for the publishable library build (build:lib).
      outDir: 'dist-app',
    },
    define: {
      // aui's dynamic @asyncapi/parser import gets bundled into the app build,
      // and the parser references process.env.
      'process.env': {},
    },
  }
})
