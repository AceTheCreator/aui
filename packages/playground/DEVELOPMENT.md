# Playground dev loop: how library rebuilds reach the browser

`npm run playground` (repo root) runs two processes with `concurrently`:

- `[0]` `vite build --watch` in `packages/aui` — rebuilds the library into `packages/aui/dist/` on every source change
- `[1]` `vite` dev server in `packages/playground` — serves the playground app

The playground imports `aui` through the npm workspace symlink
(`node_modules/aui -> packages/aui`), so Vite serves the **built files** in
`packages/aui/dist/` directly (you'll see them as `/@fs/...` URLs). That is
intentional: the playground exercises the same artifact that gets published to
npm, not the raw source.

## The race this setup has to avoid

A library rebuild is not atomic. `vite build --watch` first **empties `dist/`**
(`emptyOutDir`), then writes the outputs back over several seconds. If the
playground dev server watched `dist/` directly, the first file written would
trigger an HMR/full-reload **while `dist/aui.es.js` and `dist/aui.css` don't
exist yet** — the browser reloads into `Failed to load url ...aui.es.js. Does
the file exist?` and shows a blank screen until you reload manually. (This was
the original behavior; the symptoms are exactly those "Pre-transform error"
lines from the `[1]` process.)

## How it works now

Two small pieces, loosely coupled through one marker file, deterministic in
ordering:

1. **`packages/aui/vite.config.ts`** — the inline `buildCompleteMarker` plugin
   writes a timestamp to **`packages/aui/.build-complete`** in its
   `closeBundle` hook. In watch mode Vite closes the bundle after every rebuild
   (`BUNDLE_END`), and `closeBundle` runs only after **all** outputs (both the
   `es` and `cjs` files and their chunks) are fully written. So "the marker's
   mtime changed" is a reliable signal for "dist/ is complete again".

   The marker deliberately lives *outside* `dist/` — anything inside `dist/`
   is deleted by `emptyOutDir` at the *start* of the next rebuild, which would
   turn the marker itself into a mid-build signal. It is gitignored
   (`.build-complete` in the root `.gitignore`) and never published
   (`files: ["dist"]` in `packages/aui/package.json`).

2. **`packages/playground/vite.config.ts`** — two changes:
   - `server.watch.ignored: ['**/packages/aui/dist/**']` makes the dev server
     blind to `dist/` churn. No file event from a rebuild-in-progress can
     trigger a reload anymore.
   - The inline `auiRebuildReload` plugin polls the marker with
     `fs.watchFile` (`fs.watchFile` is used instead of `fs.watch`/chokidar
     because it tolerates the file not existing yet on first startup and
     coalesces each touch into one event). When the marker's mtime changes it
     calls `server.moduleGraph.invalidateAll()` — required because the ignored
     dist files are no longer auto-invalidated by Vite — and sends one
     `full-reload` to the browser, which now finds a complete `dist/`.

The resulting flow on every library edit:

```
save packages/aui/src/**        (playground untouched, page keeps working)
  └─ [0] build started...       dist/ emptied + rewritten (~4s)
       └─ closeBundle           .build-complete touched
            └─ [1] marker seen  invalidateAll + single full-reload
                 └─ browser     fresh, complete bundle
```

## Things to know / gotchas

- **One extra reload on startup.** The root `playground` script builds the lib
  once, then starts the watch build, whose first build also touches the
  marker. So the browser may reload once shortly after the dev server opens.
  Harmless.
- **Reload latency = library build time.** The browser intentionally waits for
  `[0] built in Xms` before reloading. If reloads feel like they stopped
  working, check the `[0]` process for a build error — no completed build, no
  marker touch, no reload. Playground-only edits (`packages/playground/src`)
  still use normal instant HMR and are unaffected by any of this.
- **Manually reloading the tab mid-build can still show the error page** — the
  files genuinely don't exist at that moment. Wait for the build to finish (or
  the automatic reload).
- **If you rename/move `packages/aui/dist` or the marker file**, update both
  vite configs together: the `ignored` glob and `auiMarker` path in
  `packages/playground/vite.config.ts`, and the marker path in
  `packages/aui/vite.config.ts`. Nothing else ties them together.
- **`vitest`/`storybook` are unaffected**: the marker plugin only runs during
  `vite build`, and writing the marker outside watch mode (e.g. a one-off
  `npm run build:lib`) is harmless — the playground reloads once, with a
  complete `dist/`.
