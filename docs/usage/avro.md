# Avro schemas

aui renders AsyncAPI messages and components whose payload (or headers) use an Avro `schemaFormat`. Support works in both [with-parser](./with-parser.md) and [no-parser](./no-parser.md) entry points — no extra install is required.

## What you need in the document

AsyncAPI 3.0 wraps non-default-format schemas in a multi-format object. Avro conversion runs **only** when `schemaFormat` is an Avro MIME type (`application/vnd.apache.avro*`). A bare Avro object without that wrapper is treated as JSON Schema and will look wrong in the tree.

Accepted formats include versioned and unversioned variants, for example:

- `application/vnd.apache.avro;version=1.9.0`
- `application/vnd.apache.avro+json;version=1.9.0`
- `application/vnd.apache.avro+yaml;version=1.9.0`
- `application/vnd.apache.avro` (and `+json` / `+yaml` without a version)

### Example

```yaml
channels:
  lightingMeasured:
    messages:
      lightMeasured:
        payload:
          schemaFormat: application/vnd.apache.avro;version=1.9.0
          schema:
            type: record
            name: LightMeasured
            fields:
              - name: lumens
                type: int
```

The same shape works as JSON:

```json
{
  "payload": {
    "schemaFormat": "application/vnd.apache.avro;version=1.9.0",
    "schema": {
      "type": "record",
      "name": "LightMeasured",
      "fields": [{ "name": "lumens", "type": "int" }]
    }
  }
}
```

## Dependencies

- **With parser:** aui registers its own browser-safe Avro schema parser on `@asyncapi/parser`. You do **not** need `@asyncapi/avro-schema-parser` (or its Node-only `avsc` dependency).
- **Without parser:** conversion happens at render time in the component — no parser and no extra dependency.

## Implementation notes (For Contributers)

This section is for contributors and anyone debugging Avro rendering. Application users can skip it.

### Pipeline

| Entry | When conversion runs | Where |
|-------|----------------------|--------|
| With parser (`parseAndRender` / `AsyncAPIRenderer`) | During parse | `AvroSchemaParser` registered on `@asyncapi/parser` |
| Without parser (`AsyncAPI`) | At render time | `resolveSchemaInput` in `schemaFormat.ts` |

Both paths share the pure converter in `helpers/avro` (`avroToJsonSchema`, `validateAvroStructure`). The converter is ported from `@asyncapi/avro-schema-parser` so behavior stays aligned without pulling Node-only deps into the browser bundle.

### Multi-format wrapper and originals

`@asyncapi/parser` converts the inner schema in place but leaves the `{ schemaFormat, schema }` wrapper intact, storing the source under `x-parser-original-payload`. The renderer always unwraps via `resolveSchemaInput`:

1. Detect multi-format wrapper (`schemaFormat` + `schema`).
2. If the format is Avro and the inner value is still Avro-shaped, convert (or reuse a prior conversion).
3. Surface `originalSchema` for the JSON tab and any `conversionError` for fail-soft UI.

The with-parser fail-soft path may set `x-aui-conversion-error` when conversion throws during parse; the renderer picks that marker up the same way.

### Why not `@asyncapi/avro-schema-parser`?

That package depends on `avsc`, which expects Node's `Buffer`. aui's `AvroSchemaParser` mirrors the upstream plugin factory (`parser.registerSchemaParser(AvroSchemaParser())`) with the same MIME list, but uses the in-tree converter so Avro documents parse identically in the browser and in Node.

### Key source files

| File | Role |
|------|------|
| `helpers/avro/avroToJsonSchema.ts` | Avro → JSON Schema conversion |
| `helpers/avro/validateAvroStructure.ts` | Structural validation before convert |
| `helpers/avro/avroSchemaParser.ts` | `@asyncapi/parser` schema-parser plugin |
| `helpers/schemaFormat.ts` | Unwrap, detect Avro MIME, resolve for the UI |
| `helpers/parser.tsx` | Registers `AvroSchemaParser` when parsing |
