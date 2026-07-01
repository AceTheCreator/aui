# aui

React component library for rendering AsyncAPI 3.x specifications.

## Structure

```
packages/
  aui/         — the component library
  playground/  — local dev app that consumes the library as a real package would
```

## Commands

All commands run from the repo root.

### Library

```bash
npm run build:lib    # build the library → packages/aui/dist/
npm run dev:lib      # start the library dev server (Vite)
npm run storybook    # run Storybook on localhost:6006
```

### Playground

```bash
npm run build:lib    # required once before first run
npm run playground   # starts both the library watcher and the playground dev server
```

The library rebuilds automatically whenever you change a file in `packages/aui/src/`. Reload the playground tab to pick up the new build.

### Publishing

From `packages/aui/`:

```bash
npm publish          # runs prepublishOnly (vite build) automatically, then publishes
```
