# Protobuf schemas

aui renders AsyncAPI messages and components whose payload (or headers) use a Protobuf `schemaFormat`. Support works in both [with-parser](./with-parser.md) and [no-parser](./no-parser.md) entry points — no extra install is required (the `.proto` text parser, [protobufjs](https://www.npmjs.com/package/protobufjs), ships as a regular dependency of aui).

## What you need in the document

AsyncAPI 3.0 wraps non-default-format schemas in a multi-format object. Protobuf conversion runs **only** when `schemaFormat` is a Protobuf MIME type (`application/vnd.google.protobuf*`) **and** the schema body is a string of `.proto` source (in YAML, use a block scalar).

Accepted formats include versioned and unversioned variants, for example:

- `application/vnd.google.protobuf;version=2`
- `application/vnd.google.protobuf;version=3`
- `application/vnd.google.protobuf` (and any other `;version=` value)

### Example

```yaml
channels:
  lightingMeasured:
    messages:
      sensorReading:
        payload:
          schemaFormat: application/vnd.google.protobuf;version=3
          schema: |
            syntax = "proto3";

            message SensorReading {
              string streetlight_id = 1;
              int32 lumens = 2;
            }
```

The same shape works as JSON, with the source as an escaped string:

```json
{
  "payload": {
    "schemaFormat": "application/vnd.google.protobuf;version=3",
    "schema": "syntax = \"proto3\";\nmessage SensorReading { string streetlight_id = 1; int32 lumens = 2; }"
  }
}
```

### Root message selection

The converter renders one root message per schema. When the source defines several messages, the root is the one not referenced by any other message; if several qualify, mark one with a `// @RootNode` comment or the conversion fails with a "Found more than one root proto messages" error (shown fail-soft in the UI).

### Comment annotations

Comments on messages and fields become descriptions. `@`-annotations inside comments become JSON Schema constraints, mirroring `@asyncapi/protobuf-schema-parser`:

| Annotation | Effect |
|------------|--------|
| `@RootNode` | Marks the root message when several candidates exist |
| `@Example <value>` | Adds to `examples` (repeatable) |
| `@Default <value>` | Sets `default` |
| `@Required` | Marks an `optional` field as required |
| `@Min` / `@Max` / `@Minimum` / `@Maximum` | `minimum` / `maximum` |
| `@ExclusiveMinimum` / `@ExclusiveMaximum` / `@MultipleOf` | Matching JSON Schema keywords |
| `@Pattern <regex>` / `@MinLength` / `@MaxLength` | String constraints |
| `@MinItems` / `@MaxItems` | Array constraints on `repeated` fields |
| `@Option primitiveTypesWithLimits false` | Drops numeric wire-type ranges from scalars |

[protovalidate](https://github.com/bufbuild/protovalidate) (`(buf.validate.field)`) and [protoc-gen-validate](https://github.com/bufbuild/protoc-gen-validate) (`(validate.rules)`) field options are also translated into constraints.

### Limitations

- **Imports resolve only against bundled definitions**: `google/protobuf/*` (well-known types, via protobufjs), `google/type/*` (googleapis common types, bundled in aui), and the `validate`/`buf.validate` option protos. Any other `import` fails with "Imports are currently not implemented" (rendered fail-soft: raw source plus a warning).
- **`map<k, v>` fields** render as their value type (upstream parity), not as an object with `additionalProperties`.

## Dependencies

- **With parser:** aui registers its own Protobuf schema parser on `@asyncapi/parser`. You do **not** need `@asyncapi/protobuf-schema-parser`.
- **Without parser:** conversion happens at render time in the component — no parser needed.

## Implementation notes (For Contributers)

This section is for contributors and anyone debugging Protobuf rendering. Application users can skip it.

### Pipeline

| Entry | When conversion runs | Where |
|-------|----------------------|--------|
| With parser (`parseAndRender` / `AsyncAPIRenderer`) | During parse | `ProtobufSchemaParser` registered on `@asyncapi/parser` |
| Without parser (`AsyncAPI`) | At render time | `resolveSchemaInput` in `schemaFormat.ts` |

Both paths share the pure converter in `helpers/protobuf` (`protoToJsonSchema`, `validateProtobufStructure`). The converter is ported from `@asyncapi/protobuf-schema-parser` so behavior stays aligned; only `protobufjs` (browser-safe) is pulled into the bundle.

### Multi-format wrapper and originals

`@asyncapi/parser` converts the inner schema in place but leaves the `{ schemaFormat, schema }` wrapper intact, storing the source under `x-parser-original-payload`. The renderer always unwraps via `resolveSchemaInput`:

1. Detect multi-format wrapper (`schemaFormat` + `schema`).
2. If the format is Protobuf and the inner value is a string, convert. (The string check is the whole raw-vs-converted discriminator — `.proto` source can only arrive as a string.)
3. Surface `originalSchema` (the raw source, shown verbatim on the JSON tab) and any `conversionError` for fail-soft UI.

The with-parser fail-soft path may set `x-aui-conversion-error` when conversion throws during parse; the renderer picks that marker up the same way.

### Why not `@asyncapi/protobuf-schema-parser`?

That package declares `@asyncapi/parser` as a hard runtime dependency (aui keeps it an optional peer) and does not export its bare converter, which the without-parser render path needs. aui's `ProtobufSchemaParser` mirrors the upstream plugin factory (`parser.registerSchemaParser(ProtobufSchemaParser())`) with the same MIME types, but uses the in-tree converter and returns a fail-soft error marker instead of throwing.

### Key source files

| File | Role |
|------|------|
| `helpers/protobuf/protoToJsonSchema.ts` | `.proto` source → JSON Schema conversion (via protobufjs) |
| `helpers/protobuf/primitiveTypes.ts` | Scalar type map (`int32`, `bytes`, … + `x-primitive`) |
| `helpers/protobuf/googleTypes.ts` | Bundled `google/type/*` definitions for offline imports |
| `helpers/protobuf/protovalidate.ts` / `protocGenValidate.ts` | `buf.validate` / `validate.rules` option translation |
| `helpers/protobuf/validateProtobufStructure.ts` | Compile-based validation before convert |
| `helpers/protobuf/protobufSchemaParser.ts` | `@asyncapi/parser` schema-parser plugin |
| `helpers/schemaFormat.ts` | Unwrap, detect Protobuf MIME, resolve for the UI |
| `helpers/parser.tsx` | Registers `ProtobufSchemaParser` when parsing |
