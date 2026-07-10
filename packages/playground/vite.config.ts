import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

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

export default defineConfig({
  plugins: [react(), auiRebuildReload()],
  server: {
    watch: {
      // dist/ churns while the library rebuilds; the marker plugin above owns reloads.
      ignored: ['**/packages/aui/dist/**'],
    },
  },
  define: {
    "process.env": {},
  },
});
