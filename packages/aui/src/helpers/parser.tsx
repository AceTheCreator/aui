import AsyncAPI from "../containers/AsyncAPI/AsyncAPI";
import { AsyncAPIDocumentData } from "../types/schema";
import type { ConfigInterface } from "../config/config";
import type { AsyncAPIDocumentInterface } from "@asyncapi/parser";
import { registerAvroSchemaParser } from "./avro/avroSchemaParser";

async function loadParser() {
  try {
    const { default: Parser } = await import("@asyncapi/parser/browser");
    return Parser;
  } catch {
    throw new Error(
      "[aui] The parsed entry requires '@asyncapi/parser'. " +
        "Install it (`npm i @asyncapi/parser`), or use 'aui' with a pre-resolved document.",
    );
  }
}

export async function parseDocument(raw: string): Promise<{
  diagnostics: unknown[];
  document: AsyncAPIDocumentData | null;
}> {
  const Parser = await loadParser();
  const parser = new Parser();

  // Built-in Avro plugin: exact MIME list plus any-version registry fallback.
  registerAvroSchemaParser(parser);

  try {
    const { document, diagnostics } = await parser.parse(raw);

    return {
      diagnostics,
      document: document ? unwrap(document) : null,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to parse document";

    return {
      diagnostics: [
        {
          message,
          path: [],
          severity: 0,
        },
      ],
      document: null,
    };
  }
}

export async function parseAndRender(raw: string, config?: ConfigInterface) {
  const { diagnostics, document } = await parseDocument(raw);

  return {
    diagnostics,
    view: document ? (
      <AsyncAPI kind="resolved" doc={document} config={config} />
    ) : null,
  };
}

function unwrap(document: AsyncAPIDocumentInterface): AsyncAPIDocumentData {
  return document.json() as AsyncAPIDocumentData;
}
