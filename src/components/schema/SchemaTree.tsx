import { useMemo } from "react";
import { useAsyncAPIDocument } from "../../contexts";
import { asSchemaNode } from "../../types/schema";
import SchemaNode from "./SchemaNode";
import SchemaTreeRow from "./SchemaTreeRow";
import {
  flattenAllOf,
  getItemSchema,
  getTypeLabel,
  hasExpandableContent,
  mergeDescriptions,
  refNameFromPath,
} from "./schemaUtils";

export interface SchemaTreeProps {
  schema: unknown;
  /** When set, the name is assumed shown by the parent — only a root toggle is rendered. */
  rootName?: string;
  className?: string;
}

/** Entry point: renders a full schema tree with $ref resolution and expand/collapse. */
export default function SchemaTree({
  schema,
  rootName,
  className = "",
}: SchemaTreeProps) {
  const { deref } = useAsyncAPIDocument();
  const refStack = useMemo(() => new Set<string>(), []);
  const node = asSchemaNode(schema);
  const flattenedNode = useMemo(
    () => (node ? flattenAllOf(node, deref, refStack) : null),
    [node, deref, refStack]
  );

  if (!node || !flattenedNode) {
    return (
      <p className="text-xs text-gray-400 italic">
        No schema details available.
      </p>
    );
  }

  const initialPath =
    rootName ??
    (node.$ref ? refNameFromPath(node.$ref) : undefined) ??
    "schema";

  const suppressRootRow = Boolean(rootName);
  const expandable = hasExpandableContent(flattenedNode, deref);

  if (!expandable && !node.$ref) {
    if (suppressRootRow) {
      if (flattenedNode.type === "array" || flattenedNode.items) {
        return (
          <div className={className}>
            <SchemaNode
              schema={node}
              path={initialPath}
              depth={0}
              refStack={refStack}
              deref={deref}
            />
          </div>
        );
      }
      return null;
    }

    const arrayPath =
      flattenedNode.type === "array" || flattenedNode.items
        ? `${initialPath}[]`
        : initialPath;

    return (
      <div className={className}>
        <SchemaTreeRow
          path={arrayPath}
          depth={0}
          typeLabel={getTypeLabel(flattenedNode)}
          description={
            flattenedNode.type === "array" || flattenedNode.items
              ? mergeDescriptions(
                flattenedNode.description,
                getItemSchema(flattenedNode)?.description
              )
              : flattenedNode.description
          }
          expandable={false}
          expanded={false}
          onToggle={() => undefined}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <SchemaNode
        schema={node}
        path={initialPath}
        depth={0}
        refStack={refStack}
        deref={deref}
        suppressRow={suppressRootRow}
      />
    </div>
  );
}
