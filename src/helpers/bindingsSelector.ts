import spec from "@asyncapi/specs";

interface IProps {
  protocol: string;
  version?: string;
}

const schemaDefs = spec.schemasWithoutId["3.0.0"].definitions;

function filterKeys(keys, keyFinder) {
  return keys.filter((str: string) => str.includes(keyFinder));
}

export default function bindingSelector(protocol, version): IProps {
  let schema = {};
  const $keys = Object.keys(schemaDefs);

  const res = filterKeys($keys, `bindings-${protocol}`);
  if (res) {
    const serverKeys = filterKeys(res, "server");
    if (serverKeys) {
      if (version) {
        const newKey = `bindings-${protocol}-${version}-server`;
        schema = schemaDefs[newKey];
      } else {
        schema = schemaDefs[serverKeys[0]];
      }
    }
  }

  return schema;
}
