import r2wc from "@r2wc/react-to-web-component";
import "apiuikit/style.css";
import { AsyncApiElement, AsyncApiRendererElement } from "./adapters";
import { defineOnce } from "./registerElement";

defineOnce(
  "aui-asyncapi",
  r2wc(AsyncApiElement, {
    props: {
      spec: undefined,
      resolved: "boolean",
      config: "json",
    },
  }),
);

defineOnce(
  "aui-asyncapi-renderer",
  r2wc(AsyncApiRendererElement, {
    props: {
      spec: "string",
      config: "json",
      onDiagnostics: undefined,
    },
  }),
);
