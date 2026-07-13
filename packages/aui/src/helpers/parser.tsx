import AsyncAPI from "../containers/AsyncAPI/AsyncAPI";
import { AsyncAPIDocumentData } from "../types/schema";
import type { ConfigInterface } from "../config/config";
import type { AsyncAPIDocumentInterface } from "@asyncapi/parser";

async function loadParser() {
  try {
    const { default: Parser } = await import("@asyncapi/parser/browser");
    return Parser;
  } catch (err) {
    console.error("[aui] Failed to load '@asyncapi/parser/browser':", err);
    throw new Error(
      "[aui] The parsed entry requires '@asyncapi/parser'. " +
        "Install it (`npm i @asyncapi/parser`), or use 'aui' with a pre-resolved document.",
    );
  }
}

async function registerOptionalSchemaParsers(
  parser: InstanceType<Awaited<ReturnType<typeof loadParser>>>,
) {
  // Skip loading Node-only schema parsers in the browser.
  if (typeof window !== "undefined") {
    if (import.meta.env.DEV) {
      console.info(
        "[aui] Skipping optional Avro schema parser in the browser. " +
          "@asyncapi/avro-schema-parser currently depends on Node.js APIs.",
      );
    }
    return;
  }

  try {
    const { default: AvroSchemaParser } =
      await import("@asyncapi/avro-schema-parser");
    parser.registerSchemaParser(AvroSchemaParser());
  } catch (err) {
    console.warn("[aui] Failed to load optional Avro schema parser.", err);
  }
}

export async function parseDocument(raw: string): Promise<{
  diagnostics: unknown[];
  document: AsyncAPIDocumentData | null;
}> {
  const Parser = await loadParser();
  const parser = new Parser();

  await registerOptionalSchemaParsers(parser);

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
