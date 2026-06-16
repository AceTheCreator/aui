export interface SchemaNodeData {
  type?: string | string[];
  format?: string;
  description?: string;
  enum?: unknown[];
  const?: unknown;
  required?: string[];
  properties?: Record<string, SchemaNodeData>;
  items?: SchemaNodeData | SchemaNodeData[];
  allOf?: SchemaNodeData[];
  oneOf?: SchemaNodeData[];
  anyOf?: SchemaNodeData[];
  $ref?: string;
  [key: string]: unknown;
}

export const isSchemaRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const asSchemaNode = (value: unknown): SchemaNodeData | null =>
  isSchemaRecord(value) ? (value as SchemaNodeData) : null;
