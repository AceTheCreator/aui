import { ConfigInterface, defaultConfig } from "../../config";
import { AsyncAPIDocumentData } from "../../types/schema";
import Layout from "./Layout";

export type IAsyncAPIProps =
  | { asyncapi: AsyncAPIDocumentData; config?: ConfigInterface }
  | { kind: "resolved"; doc: AsyncAPIDocumentData; config?: ConfigInterface };

const AsyncAPI = (props: IAsyncAPIProps) => {
  const asyncapi = "doc" in props ? props.doc : props.asyncapi;
  const config = props.config ?? defaultConfig;
  return <Layout asyncapi={asyncapi} config={config} />;
};

export default AsyncAPI;
