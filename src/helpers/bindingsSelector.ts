import spec from "@asyncapi/specs";

interface Schema {
  type?: string;
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}
type SchemaDefs = Record<string, Schema>; //replace with JSON schema draft;

const schemaDefs: SchemaDefs = spec.schemasWithoutId["3.0.0"].definitions;

function filterKeys(keys: string[], keyFinder: string): string[] {
  return keys.filter((str: string) => str.includes(keyFinder));
}

export default function bindingSelector(
  protocol: string,
  version: string
): Schema {
  let schema: Schema = {};
  const $keys: string[] = Object.keys(schemaDefs);

  const keyWithProtocol: string[] = filterKeys($keys, `bindings-${protocol}`);
  if (keyWithProtocol.length > 0) {
    const serverKeys: string[] = filterKeys(keyWithProtocol, "server");

    if (serverKeys) {
      if (version) {
        const versionKey: string = `bindings-${protocol}-${version}-server`;
        schema = schemaDefs[versionKey];
      } else {
        schema = schemaDefs[serverKeys[0]];
      }
    }
  }

  return schema;
}
