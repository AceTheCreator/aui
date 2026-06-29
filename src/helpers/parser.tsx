import AsyncAPI from "../containers/AsyncAPI";
import { AsyncAPIDocumentData } from "../types/schema";
import type { ConfigInterface } from "../config/config";
import type { AsyncAPIDocumentInterface } from "@asyncapi/parser"; // type-only, erased at build

export async function parseAndRender(raw: string, config?: ConfigInterface) {
  let Parser;
  try {
    // Dynamic import => its own lazy chunk, absent from the default entry's static graph.
    ({ default: Parser } = await import("@asyncapi/parser/browser"));
  } catch {
    throw new Error(
      "[aui] The parsed entry requires '@asyncapi/parser'. " +
        "Install it (`npm i @asyncapi/parser`), or use 'aui' with a pre-resolved document.",
    );
  }

  const { document, diagnostics } = await new Parser().parse(raw);
  console.log(document)

  if (!document) {
    return { diagnostics, view: null };
  }

  const plain = unwrap(document);

  // Return an element (not a direct call) so hooks run inside React's render cycle.
  return {
    diagnostics,
    view: <AsyncAPI kind="resolved" doc={plain} config={config} />,
  };
}


// TODO: output may carry x-parser-* keys and real object cycles.
// Core must tolerate unknown x-* keys today; cycle tolerance is the backlog item.
function unwrap(document: AsyncAPIDocumentInterface): AsyncAPIDocumentData {
  return document.json() as AsyncAPIDocumentData;
}
