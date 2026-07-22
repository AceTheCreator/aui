import { useMemo } from "react";
import { ConfigInterface, defaultConfig } from "../../config";
import { resolveDocument } from "../../helpers/resolveDocument";
import { AsyncAPIDocumentData } from "../../types/schema";
import Layout from "./Layout";

export type IAsyncAPIProps =
  | { asyncapi: AsyncAPIDocumentData; config?: ConfigInterface }
  | { kind: "resolved"; asyncapi: AsyncAPIDocumentData; config?: ConfigInterface };

const AsyncAPI = (props: IAsyncAPIProps) => {
  const raw = props.asyncapi;
  // Always resolve: documents without $refs (including `kind: "resolved"`
  // parser output) pass through resolveDocument's cheap scan untouched —
  // identity preserved, no copy — while documents that still carry refs get
  // inlined even if the caller wrongly promised they were pre-resolved.
  const asyncapi = useMemo(() => resolveDocument(raw), [raw]);
  const config = props.config ?? defaultConfig;
  return <Layout asyncapi={asyncapi} config={config} />;
};

export default AsyncAPI;
