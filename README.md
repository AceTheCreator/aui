# apiuikit

React component library for rendering API specifications. Point it at an AsyncAPI document and get a full interactive UI, which includes: servers, channels, operations, messages, schemas, with no manual mapping required.

> **Status:** AsyncAPI 3.x is fully supported today. OpenAPI support is coming soon, the same components will render OpenAPI documents once that lands.

## Install

```bash
npm install apiuikit
```

If you want to hand it a raw YAML/JSON string instead of a pre-parsed object, also install the peer dependency:

```bash
npm install @asyncapi/parser
```

[![Edit Apiuikit React Component](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/6jw4pf)

## Usage in React

The quickest path to use the kit for AsyncAPI is to pass a pre-resolved AsyncAPI document object (e.g. imported from a JSON file, or fetched from your own backend):

```tsx
import AsyncAPI from "apiuikit";
import "apiuikit/style.css";
import doc from "./asyncapi.json";

export default function App() {
  return <AsyncAPI asyncapi={doc} />;
}
```

If you have a raw YAML/JSON string instead (e.g. entered by a user, or loaded from a file at runtime), use `AsyncAPIRenderer`, which parses and validates it for you:

```tsx
import { AsyncAPIRenderer } from "apiuikit";
import "apiuikit/style.css";

export default function App() {
  return <AsyncAPIRenderer raw={rawYamlOrJsonString} />;
}
```

Avro and Protobuf message payloads are supported out of the box in both entry points, no extra install required.

See the full usage docs for props, configuration options, and more:

- [Without Parser](./docs/usage/no-parser.md) (`AsyncAPI` component)
- [With Parser](./docs/usage/with-parser.md) (`AsyncAPIRenderer` component, `parseAndRender` utility)
- [Web Components](./docs/usage/with-webcomponents.md) (`<aui-asyncapi>`, `<aui-asyncapi-renderer>` — use apiuikit from any framework)
- [Avro schemas](./docs/usage/avro.md)
- [Protobuf schemas](./docs/usage/protobuf.md)

## Development

This is a monorepo. The sections below are for contributors working on the library itself, skip these if you're just consuming the published package.

### Structure

```
packages/
  lib/         — the component library (published as "apiuikit")
  playground/  — local dev app that consumes the library as a real package would
```

### Commands

All commands run from the repo root.

#### Library

```bash
npm run build:lib    # build the library → packages/lib/dist/
npm run dev:lib      # start the library dev server (Vite)
npm run storybook    # run Storybook on localhost:6006
```

#### Playground

```bash
npm run build:lib    # required once before first run
npm run playground   # starts both the library watcher and the playground dev server
```

The library rebuilds automatically whenever you change a file in `packages/lib/src/`. Reload the playground tab to pick up the new build.

### Publishing

From `packages/lib/`:

```bash
npm publish          # runs prepublishOnly (vite build) automatically, then publishes
```
