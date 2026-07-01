import { Info } from "./asyncapi/Info";
import { MessageObject } from "./asyncapi/MessageObject";
import { Operation } from "./asyncapi/Operation";
import { Server } from "./asyncapi/Server";


export interface SchemaNodeData {
  type?: string | string[];
  format?: string;
  description?: string;
  enum?: unknown[];
  const?: unknown;
  required?: string[];
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  properties?: Record<string, SchemaNodeData>;
  items?: SchemaNodeData | SchemaNodeData[];
  allOf?: SchemaNodeData[];
  oneOf?: SchemaNodeData[];
  anyOf?: SchemaNodeData[];
  not?: SchemaNodeData | boolean;
  $ref?: string;
  [key: string]: unknown;
}

type AsyncAPISchemaDefinition = SchemaNodeData;

export interface AsyncAPIDocumentData extends Record<string, unknown> {
  info: Info;
  servers?: Record<string, Server>;
  operations?: Record<string, Operation>;
  components?: {
    messages?: Record<string, MessageObject>;
    schemas?: Record<string, AsyncAPISchemaDefinition>;
  };
}

export const isSchemaRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const asSchemaNode = (value: unknown): SchemaNodeData | null =>
  isSchemaRecord(value) ? (value as SchemaNodeData) : null;
