# AUI — Parser Architecture & Dual-Entry Implementation

A reference for how AUI exposes AsyncAPI rendering with an optional validation/parsing layer, while keeping the rendering core completely parser-free.

## Core principle

The library is a **parser-free rendering core** with a **validation layer bolted on top** as a separate entry. The parser is *additive*, never foundational.

- The core renders a plain, already-resolved JS object. It imports nothing from `@asyncapi/parser` — not a value, not even a type.
- A lightweight resolver (internal `$ref`s only, no remote refs) is *one* way to produce that resolved object.
- The parsed entry is the *more capable* way: it validates a raw string and fully dereferences (remote refs included) via the parser, then hands the core a plain resolved object.

Two honest tiers, meeting at one renderer.

| Entry | Input | Resolution | Validation | Needs parser |
|---|---|---|---|---|
| `aui/no-parser` | JS object | lightweight (internal refs) | none | no |
| `aui` (default) | raw string | full, via parser (incl. remote) | yes | yes |

## Module layout

The layout enforces the invariant: **only `src/parsed.ts` ever names the parser.** Everything under `src/core/` is reachable without it.

```
src/
  core/
    types.ts        // plain types — no parser
    resolver.ts     // lightweight internal-ref deref — no parser
    render.tsx      // the renderer — no parser
    index.ts        // core entry: discriminated input
  no-parser.ts      // public entry: object-in, parser-free
  parsed.ts         // public entry: string-in, parser confined HERE
```

## core/types.ts

Your own shape, so nothing downstream needs the parser even for types.

```ts
// The ONLY doc shape the core knows. Parser-agnostic.
export type AsyncApiDoc = Record<string, any>; // replace with your real structural type

// Discriminated input — tells the core whether to resolve or trust.
export type CoreInput =
  | { kind: 'raw';      doc: AsyncApiDoc }   // run my lightweight resolver
  | { kind: 'resolved'; doc: AsyncApiDoc };  // already deref'd, render as-is
```

## core/resolver.ts

Lightweight resolver: internal refs only. The re-entry branch is the important detail — it leaves a `$ref` in place when it re-encounters a pointer it's mid-resolving, so the resolver never manufactures a cycle.


## core/render.tsx

The renderer. Structural layers (info/servers/channels/operations) are a DAG with no cycle risk. Schema rendering is where cycles will eventually live, so `ctx` is threaded through that recursion **now** even though it's unused — that way the backlog cycle fix is "add a `WeakSet` to `ctx`", not "rewrite the recursion".

```tsx
import type { AsyncApiDoc } from './types';

export function AsyncApiView({ document }: { document: AsyncApiDoc }) {
  return (
    <Root>
      <Info info={document.info} />
      <Servers servers={document.servers} />
      <Channels channels={document.channels} />
      <Operations operations={document.operations} />
    </Root>
  );
}

```

## core/index.ts

The core's single entry point and the heart of the design. It decides whether to resolve, and it is **completely parser-free**. Both public entries funnel through here.

```tsx
import { resolveInternalRefs } from './resolver';
import { AsyncApiView } from './render';
import type { CoreInput } from './types';

export function renderCore(input: CoreInput) {
  const doc =
    input.kind === 'raw'
      ? resolveInternalRefs(input.doc)  // parser-free path resolves here
      : input.doc;                      // parsed path: already deref'd by parser, trust it
  return <AsyncApiView document={doc} />;
}

export { AsyncApiView };
export type { AsyncApiDoc } from './types';
```

## no-parser.ts

Public parser-free entry. Object-in, runs the lightweight resolver. Imports nothing from the parser, not even a type.

```tsx
import { renderCore } from './core';
import type { AsyncApiDoc } from './core/types';

// Consumer brings a plain JS object (validated upstream, or they don't care).
export function render(doc: AsyncApiDoc) {
  return renderCore({ kind: 'raw', doc });  // lightweight resolver handles internal refs
}

export { AsyncApiView } from './core';      // for consumers who pre-resolved too
```

## parsed.ts

The validating entry — the **only** place the parser appears. The type import is confined here and is `import type` (erased at build, no runtime edge). The value import is **dynamic**, so a consumer who imports the default entry but only renders never pulls the parser into their static graph.

```tsx
import { renderCore } from './core';
import type { AsyncApiDoc } from './core/types';
import type { AsyncAPIDocumentInterface } from '@asyncapi/parser'; // type-only, erased

export async function parseAndRender(raw: string) {
  let Parser;
  try {
    // Dynamic import => its own lazy chunk, absent from the default entry's static graph.
    ({ default: Parser } = await import('@asyncapi/parser/browser'));
  } catch {
    throw new Error(
      "[aui] The parsed entry requires '@asyncapi/parser'. " +
      "Install it (`npm i @asyncapi/parser`), or use 'aui/no-parser' with a pre-resolved document."
    );
  }

  const { document, diagnostics } = await new Parser().parse(raw);

  if (!document) {
    return { diagnostics, view: null };   // validation failed — the value-add of this entry
  }

  // UNWRAP: model wrapper -> plain object. The parser type dies on this line.
  const plain = unwrap(document);

  // Parser already fully deref'd (incl. remote refs) -> tell the core to skip its resolver.
  return { diagnostics, view: renderCore({ kind: 'resolved', doc: plain }) };
}

// The seam between the parser's model and your plain shape, isolated to one function.
function unwrap(document: AsyncAPIDocumentInterface): AsyncApiDoc {
  return document.json() as AsyncApiDoc;
  // NOTE: output may carry x-parser-* keys and real object cycles.
  // Core must tolerate unknown x-* keys today; cycle tolerance is the backlog item.
}
```

## Build & packaging

### vite.config.ts

```ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        parsed: 'src/parsed.ts',        // default
        'no-parser': 'src/no-parser.ts',
      },
      formats: ['es'], // multi-entry forbids umd/iife — es (and cjs) only
    },
    rollupOptions: {
      external: (id) =>
        /^@asyncapi\/parser/.test(id) || /^react/.test(id) || /^react-dom/.test(id),
    },
  },
});
```

### package.json (exports + dependency strategy)

The default points at the validating entry for a friendly "give me a string" experience, while the core underneath stays parser-free. The parser is declared as an **optional peer**: parser-free consumers install nothing extra and get no warning; parsed-entry consumers install it themselves, deduped with any other AsyncAPI tooling in their tree.

```jsonc
{
  "name": "aui",
  "type": "module",
  "exports": {
    ".":           { "types": "./dist/parsed.d.ts",    "import": "./dist/parsed.js" },
    "./no-parser": { "types": "./dist/no-parser.d.ts", "import": "./dist/no-parser.js" }
  },
  "peerDependencies": {
    "@asyncapi/parser": "^3.0.0"
  },
  "peerDependenciesMeta": {
    "@asyncapi/parser": { "optional": true }
  }
}
```

## Invariants (and how to test them)

- **Nothing under `src/core/` imports `@asyncapi/parser`** — value *or* type. Assertable: build the no-parser entry, grep its output and `.d.ts` for `@asyncapi/parser`, fail the test if found. This single test keeps "depend on the parser in no way" true as the code grows.
- **The parser type touches exactly one file** (`parsed.ts`), only as `import type`, so it never becomes a runtime dependency for type resolution elsewhere.
- **The parser value is reached only through `import()`**, so a default-entry consumer who only calls `render` / `AsyncApiView` ships zero parser bytes.
- **Two tiers, one renderer**: `{ kind: 'raw' }` runs the lightweight internal-only resolver; `{ kind: 'resolved' }` trusts the parser's full deref.

## Why optional peer (not `dependencies` or required peer)

- **`dependencies`** forces ~3MB on every consumer, including the first-class parser-free audience, and risks duplicate copies for ecosystem-overlapping users. Over-serves.
- **Required `peerDependencies`** fixes dedupe but warns *every* consumer, including parser-free ones, to install something they never use. Over-serves.
- **Optional peer** is structurally honest: the parser genuinely is optional — the core never needs it, one entry needs it, the other is first-class without it. Dedupes for ecosystem users, keeps parser-free consumers install-clean.

**The one cost:** the parsed entry no longer "just works" with zero install steps. A consumer who calls `parseAndRender` without installing the peer hits a failure at the dynamic import — deferred to runtime. The `try/catch` in `parsed.ts` converts the obscure module-not-found into an actionable sentence, which neutralizes most of that downside. Document in the README that the default/parsed entry needs `@asyncapi/parser` installed alongside, while `aui/no-parser` needs nothing.

> Switch back to plain `dependencies` only if a zero-install first impression matters more to adoption than install weight and dedupe — a product/DX judgment, not a technical one.

## Backlog: circular references

Cycles concentrate at the **schema/payload level** (recursive data models — a `Node` whose children are `Node`s), not in the structural layers above, which form a DAG. That containment is why deferring is legitimate: the blast radius is one identifiable subtree.

- **The fix (when scheduled):** a `WeakSet` of visited schema nodes threaded through the schema-rendering recursion; on re-encounter, render a collapsed "recursive" placeholder. Contained *because* `ctx` is already threaded through `renderSchema` today.
- **Pre-remote-refs risk:** the lightweight resolver itself can produce a cycle if it inlines a self-referential internal `$ref`. The re-entry guard above (leaving the `$ref` in place) is what keeps you incidentally safe — confirm your real resolver does the same and doesn't inline into a loop.
- **Symptom:** an unguarded recursive render of a cyclic structure is a synchronous stack overflow / tab freeze, not a graceful error.
- **Priority:** for event-driven APIs, recursive payloads aren't exotic. File as a real near-term item — not blocking, not bottom-of-pile.

## Open items to confirm against your parser version

1. `document.json()` returns the shape your `AsyncApiDoc` expects, deref'd as assumed, and you know which `x-parser-*` keys ride along.
2. Your resolver's re-entry branch leaves the `$ref` in place rather than inlining into a loop.