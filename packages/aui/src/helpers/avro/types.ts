export type AvroPrimitiveType =
  | "null"
  | "boolean"
  | "int"
  | "long"
  | "float"
  | "double"
  | "bytes"
  | "string"
  | "uuid";

export interface AvroField {
  name: string;
  type: AvroSchema;
  doc?: string;
  default?: unknown;
  order?: "ascending" | "descending" | "ignore";
  aliases?: string[];
  [key: string]: unknown;
}

export interface AvroRecordSchema {
  type: "record";
  name: string;
  namespace?: string;
  doc?: string;
  aliases?: string[];
  fields: AvroField[];
  [key: string]: unknown;
}

export interface AvroEnumSchema {
  type: "enum";
  name: string;
  namespace?: string;
  doc?: string;
  symbols: string[];
  default?: string;
  [key: string]: unknown;
}

export interface AvroArraySchema {
  type: "array";
  items: AvroSchema;
  default?: unknown[];
  [key: string]: unknown;
}

export interface AvroMapSchema {
  type: "map";
  values: AvroSchema;
  default?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AvroFixedSchema {
  type: "fixed";
  name: string;
  namespace?: string;
  size: number;
  [key: string]: unknown;
}

export interface AvroPrimitiveSchema {
  type: AvroPrimitiveType;
  logicalType?: string;
  [key: string]: unknown;
}

export type AvroSchemaObject =
  | AvroRecordSchema
  | AvroEnumSchema
  | AvroArraySchema
  | AvroMapSchema
  | AvroFixedSchema
  | AvroPrimitiveSchema;

/**
 * An Avro schema definition: a primitive-type or named-type-reference string,
 * a definition object, or a union (array of alternatives).
 */
export type AvroSchema = string | AvroSchemaObject | AvroSchema[];
