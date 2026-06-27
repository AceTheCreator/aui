import spec from "@asyncapi/specs";
import type { JSONSchema7 } from "json-schema";

type SchemaDefs = Record<string, JSONSchema7 | boolean>;

const rawDefs = spec.schemasWithoutId["3.0.0"].definitions;
const schemaDefs: SchemaDefs = (rawDefs ?? {}) as SchemaDefs;

function filterKeys(keys: string[], keyFinder: string): string[] {
  return keys.filter((str) => str.includes(keyFinder));
}

export default function bindingSelector(
  protocol: string,
  version: string | null
): JSONSchema7 {
  let schema: JSONSchema7 = {};
  const $keys = Object.keys(schemaDefs);

  const keyWithProtocol = filterKeys($keys, `bindings-${protocol}`);
  if (keyWithProtocol.length > 0) {
    const serverKeys = filterKeys(keyWithProtocol, "server");

    if (serverKeys.length > 0) {
      const key = version
        ? `bindings-${protocol}-${version}-server`
        : serverKeys[0];
      const found = schemaDefs[key];
      if (found && typeof found !== "boolean") {
        schema = found;
      }
    }
  }

  return schema;
}
