import { SchemaNodeData } from "../../types/schema";
import { getDepthColors } from "./depthColors";
import ExpandToggle from "./ExpandToggle";
import SchemaConstraints from "./SchemaConstraints";
import { hasConstraints } from "./schemaUtils";
import SchemaTypeLabel from "./SchemaTypeLabel";
import { shouldShowRefFootnote } from "./schemaDisplayUtils";

export interface SchemaTreeRowProps {
  path: string;
  depth: number;
  schema?: SchemaNodeData;
  refLabel?: string;
  itemSchema?: SchemaNodeData | null;
  typeLabelOverride?: string;
  required?: boolean;
  description?: string;
  expandable: boolean;
  expanded: boolean;
  onToggle: () => void;
  /** When false, omit the row divider — used when a parent group owns the border. */
  showBorder?: boolean;
}

/** Indent for constraints and description — aligns with text after expand toggle. */
const CONTENT_INDENT = "ml-6";

/** Single tree row: name, type, constraints, and optional description. */
export default function SchemaTreeRow({
  path,
  depth,
  schema,
  refLabel,
  itemSchema,
  typeLabelOverride,
  required,
  description,
  expandable,
  expanded,
  onToggle,
  showBorder = true,
}: SchemaTreeRowProps) {
  const colors = getDepthColors(depth);
  const showRef = schema && shouldShowRefFootnote(schema, refLabel);

  // Split "parent.child.name", "parent.pair[]", or "parent[].name" — highlight final segment.
  let prefix = "";
  let name = path;

  if (path.endsWith("[]")) {
    const base = path.slice(0, -2);
    const dotIndex = base.lastIndexOf(".");
    if (dotIndex >= 0) {
      prefix = base.slice(0, dotIndex + 1);
      name = `${base.slice(dotIndex + 1)}[]`;
    } else {
      name = path;
    }
  } else {
    const dotIndex = path.lastIndexOf(".");
    const bracketIndex = path.lastIndexOf("[]");
    const splitIndex = Math.max(dotIndex, bracketIndex);

    if (splitIndex >= 0) {
      prefix = path.slice(0, splitIndex + (path[splitIndex] === "." ? 1 : 2));
      name = path.slice(splitIndex + (path[splitIndex] === "." ? 1 : 2));
    }
  }

  return (
    <div
      className={`py-2 ${showBorder ? "border-b border-gray-100 last:border-b-0" : ""}`}
    >
      <div className="flex items-center gap-2 min-h-[24px]">
        {expandable ? (
          <ExpandToggle depth={depth} expanded={expanded} onToggle={onToggle} />
        ) : (
          <span className="w-4 shrink-0" aria-hidden="true" />
        )}
        <span className="text-xs font-mono flex-1 min-w-0 truncate">
          {prefix && <span className="text-gray-400">{prefix}</span>}
          <span className={`font-semibold ${colors.text}`}>{name}</span>
          {required && (
            <span className="text-red-500 ml-2 text-[10px]">required</span>
          )}
        </span>
        {schema ? (
          <div className="shrink-0 text-right">
            <SchemaTypeLabel schema={schema} refLabel={refLabel} />
            {showRef && (
              <span className="text-xs text-gray-400"> (ref: {refLabel})</span>
            )}
          </div>
        ) : (
          typeLabelOverride && (
            <span className="text-xs text-gray-500 shrink-0">
              {typeLabelOverride}
            </span>
          )
        )}
      </div>
      {schema && hasConstraints(schema, itemSchema) && (
        <SchemaConstraints
          schema={schema}
          itemSchema={itemSchema}
          fieldName={name}
          className={`flex flex-col gap-1 mt-1 ${CONTENT_INDENT}`}
        />
      )}
      {description &&
        description.split("\n\n").map((paragraph, index) => (
          <p
            key={index}
            className={`text-xs text-gray-500 mt-1 ${CONTENT_INDENT} leading-relaxed`}
          >
            {paragraph}
          </p>
        ))}
    </div>
  );
}
