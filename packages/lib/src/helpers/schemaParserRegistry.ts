/**
 * Shared registration plumbing for the lib's built-in @asyncapi/parser schema
 * parser plugins (Avro, Protobuf). All @asyncapi/parser imports are type-only,
 * so this module adds no runtime dependency on the parser.
 */
import type { SchemaParser } from "@asyncapi/parser";

/** Minimal parser surface needed to register and patch MIME lookup. */
export interface SchemaParserHost {
  registerSchemaParser(parser: SchemaParser): unknown;
  parserRegistry: {
    get(key: string): SchemaParser | undefined;
  };
}

/**
 * Registers a schema parser plugin and patches the parser registry so any
 * schemaFormat matching `matchesFormat` resolves to it — parser-js matches
 * schemaFormat strings exactly, so unlisted versions (e.g.
 * `application/vnd.apache.avro;version=1.11.0`) would otherwise be rejected.
 *
 * The patch composes: each wrapper delegates to the previous `get`, so
 * registering several plugins this way stacks their fallbacks.
 */
export function registerSchemaParserWithFallback(
  parser: SchemaParserHost,
  schemaParser: SchemaParser,
  matchesFormat: (format: string) => boolean,
): void {
  parser.registerSchemaParser(schemaParser);

  const registry = parser.parserRegistry;
  const originalGet = registry.get.bind(registry);
  registry.get = (key: string) => {
    const hit = originalGet(key);
    if (hit !== undefined) return hit;
    return matchesFormat(key) ? schemaParser : undefined;
  };
}
