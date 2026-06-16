import { SchemaNodeData } from "../../types/schema";
import {
  getItemConstraintsLabel,
  getTypeLabel,
  isLeafItemSchema,
} from "./schemaUtils";

/** Compact details for a leaf oneOf branch — avoids duplicating the property path row. */
export default function SchemaCaseDetail({
  schema,
  showBorder = true,
}: {
  schema: SchemaNodeData;
  showBorder?: boolean;
}) {
  let typeLabel = getTypeLabel(schema);
  if (isLeafItemSchema(schema)) {
    const types = Array.isArray(schema.type)
      ? schema.type.join(" | ")
      : schema.type;
    typeLabel = (types ?? "unknown") + getItemConstraintsLabel(schema);
  }
  const description =
    typeof schema.description === "string" ? schema.description : undefined;

  return (
    <div
      className={`py-2 ${showBorder ? "border-b border-gray-100 last:border-b-0" : ""}`}
    >
      <div className="flex items-center gap-2 min-h-[24px]">
        <span className="w-4 shrink-0" aria-hidden="true" />
        <span className="text-xs text-gray-500">{typeLabel}</span>
      </div>
      {description &&
        description.split("\n\n").map((paragraph, index) => (
          <p
            key={index}
            className="text-xs text-gray-500 mt-1 ml-6 leading-relaxed"
          >
            {paragraph}
          </p>
        ))}
    </div>
  );
}
