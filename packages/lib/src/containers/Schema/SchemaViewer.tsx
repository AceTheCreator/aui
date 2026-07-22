import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';

interface SchemaViewerProps {
  schema: object | unknown;
  title?: string;
}

const PARSER_EXTENSION_PATTERN = /^x-parser-/i;

/** Recursively strips @asyncapi/parser's internal `x-parser-*` bookkeeping extensions
 * (e.g. x-parser-schema-id) before display — the parser bakes these into every schema
 * node unconditionally during parsing; they're not part of the user's actual spec.
 *
 * `active` tracks the chain currently being walked: pre-resolved documents can
 * contain genuine object cycles (a schema holding itself as a plain object
 * reference), which would otherwise recurse forever and then break
 * JSON.stringify. Cycle re-entries render as a "[circular]" placeholder;
 * shared-but-acyclic objects (two properties referencing the same schema) are
 * unaffected because the chain is unwound on exit. */
function stripParserExtensions(value: unknown, active = new Set<object>()): unknown {
  if (value !== null && typeof value === 'object') {
    if (active.has(value)) return '[circular]';
    active.add(value);
    try {
      if (Array.isArray(value)) {
        return value.map((item) => stripParserExtensions(item, active));
      }
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        if (PARSER_EXTENSION_PATTERN.test(key)) continue;
        result[key] = stripParserExtensions(val, active);
      }
      return result;
    } finally {
      active.delete(value);
    }
  }
  return value;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  // Raw source bodies (e.g. .proto text) render as-is; only object/array
  // schemas get JSON.stringify'd — stringifying an already-raw string would
  // double-encode it (escaped quotes, literal \n).
  const code =
    typeof schema === 'string'
      ? schema
      : JSON.stringify(stripParserExtensions(schema), null, 2);

  return <CodeBlock code={code} />;
};
