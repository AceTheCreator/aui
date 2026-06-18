import { SchemaNodeData } from "../../types/schema";
import {
  getAnyOfItems,
  getItemSchema,
  getOneOfItems,
  refNameFromPath,
} from "./schemaUtils";

export interface TypeDisplay {
  text: string;
  format?: string;
  refHint?: string;
}

/** Builds structured type display for SchemaTypeLabel. */
export const buildTypeDisplay = (
  schema: SchemaNodeData,
  refLabel?: string
): TypeDisplay => {
  const oneOfItems = getOneOfItems(schema);
  if (oneOfItems) {
    return { text: `one of (${oneOfItems.length})` };
  }

  const anyOfItems = getAnyOfItems(schema);
  if (anyOfItems) {
    return { text: `any of (${anyOfItems.length})` };
  }

  if (schema.type === "array" || schema.items) {
    const itemSchema = getItemSchema(schema);
    if (itemSchema) {
      const itemType = itemSchema.type;
      if (itemType === "object") {
        const name = itemSchema.$ref
          ? refNameFromPath(itemSchema.$ref)
          : refLabel;
        return name
          ? { text: "Array of objects", refHint: name }
          : { text: "Array of objects" };
      }
      if (typeof itemType === "string") {
        const format =
          typeof itemSchema.format === "string" ? itemSchema.format : undefined;
        return { text: `Array of ${itemType}`, format };
      }
    }
    return { text: "array" };
  }

  const types = Array.isArray(schema.type)
    ? schema.type.join(" | ")
    : schema.type;
  const text = types ?? "unknown";
  const format =
    typeof schema.format === "string" ? schema.format : undefined;
  const refHint =
    refLabel && types === "object" ? refLabel : undefined;

  return { text, format, refHint };
};

/** Whether to show a separate ref footnote beside the type label. */
export const shouldShowRefFootnote = (
  schema: SchemaNodeData,
  refLabel?: string
): boolean => {
  if (!refLabel) return false;
  const typeDisplay = buildTypeDisplay(schema, refLabel);
  return (
    !typeDisplay.refHint && !typeDisplay.text.includes(`(${refLabel})`)
  );
};
