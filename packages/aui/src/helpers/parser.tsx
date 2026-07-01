import AsyncAPI from "../containers/AsyncAPI/AsyncAPI";
import { AsyncAPIDocumentData } from "../types/schema";
import type { ConfigInterface } from "../config/config";
import type { AsyncAPIDocumentInterface } from "@asyncapi/parser"; // type-only, erased at build

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

// Internal — returns the raw document so callers can decide how to render it.
export async function parseDocument(raw: string): Promise<{ diagnostics: unknown[]; document: AsyncAPIDocumentData | null }> {
  const Parser = await loadParser();
  const { document, diagnostics } = await new Parser().parse(raw);
  return { diagnostics, document: document ? unwrap(document) : null };
}

// Public utility — parses and returns a ready-to-mount React element.
export async function parseAndRender(raw: string, config?: ConfigInterface) {
  const { diagnostics, document } = await parseDocument(raw);
  return {
    diagnostics,
    view: document ? <AsyncAPI kind="resolved" doc={document} config={config} /> : null,
  };
}

// TODO: output may carry x-parser-* keys and real object cycles.
// Core must tolerate unknown x-* keys today; cycle tolerance is the backlog item.
function unwrap(document: AsyncAPIDocumentInterface): AsyncAPIDocumentData {
  return document.json() as AsyncAPIDocumentData;
}
