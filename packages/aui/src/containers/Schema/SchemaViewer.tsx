import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { hljs } from '../../helpers/marked';

interface SchemaViewerProps {
  schema: object | unknown;
  title?: string;
}

const PARSER_EXTENSION_PATTERN = /^x-parser-/i;

/** Recursively strips @asyncapi/parser's internal `x-parser-*` bookkeeping extensions
 * (e.g. x-parser-schema-id) before display — the parser bakes these into every schema
 * node unconditionally during parsing; they're not part of the user's actual spec. */
function stripParserExtensions(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripParserExtensions);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (PARSER_EXTENSION_PATTERN.test(key)) continue;
      result[key] = stripParserExtensions(val);
    }
    return result;
  }
  return value;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  const json = JSON.stringify(stripParserExtensions(schema), null, 2);
  const highlighted = hljs.highlight(json, { language: 'json' }).value;

  return (
      <pre className="text-xs rounded overflow-x-auto">
        <code
          className="hljs language-json"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlighted) }}
        />
      </pre>
  );
};
