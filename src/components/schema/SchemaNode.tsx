import { useMemo, useState } from "react";
import { isSchemaRecord, SchemaNodeData } from "../../types/schema";
import ExpandToggle from "./ExpandToggle";
import SchemaCaseDetail from "./SchemaCaseDetail";
import SchemaUnionBranch from "./SchemaUnionBranch";
import SchemaTreeBranch from "./SchemaTreeBranch";
import SchemaTreeRow from "./SchemaTreeRow";
import {
  flattenAllOf,
  getAnyOfItems,
  getItemSchema,
  getOneOfItems,
  getTypeLabel,
  isLeafItemSchema,
  mergeDescriptions,
  normalizeSchema,
} from "./schemaUtils";

export interface SchemaNodeProps {
  schema: SchemaNodeData;
  path: string;
  depth: number;
  required?: boolean;
  refStack: Set<string>;
  deref: (ref: string) => unknown;
  /** When true, skip this node's row and render only a root toggle + children. */
  suppressRow?: boolean;
}

/** Recursively renders one schema node and its descendants. */
export default function SchemaNode({
  schema: rawSchema,
  path,
  depth,
  required,
  refStack,
  deref,
  suppressRow = false,
}: SchemaNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedCase, setSelectedCase] = useState(0);

  const { schema, refLabel, circular } = useMemo(() => {
    const normalized = normalizeSchema(rawSchema, deref, refStack);
    if (normalized.circular) return normalized;
    return {
      ...normalized,
      schema: flattenAllOf(normalized.schema, deref, refStack),
    };
  }, [rawSchema, deref, refStack]);

  if (circular) {
    return (
      <SchemaTreeRow
        path={path}
        depth={depth}
        typeLabel={`↩ ${rawSchema.$ref}`}
        expandable={false}
        expanded={false}
        onToggle={() => undefined}
      />
    );
  }

  const oneOfItems = getOneOfItems(schema);
  const anyOfItems = getAnyOfItems(schema);
  const unionItems = oneOfItems ?? anyOfItems;
  const unionVariant = oneOfItems ? "oneOf" : "anyOf";

  if (unionItems) {
    const caseLabels = unionItems.map((item, index) =>
      typeof item.title === "string" ? item.title : `case ${index + 1}`
    );
    const caseDepth = suppressRow ? 1 : depth + 1;
    const selectedRaw = unionItems[selectedCase]!;
    const normalizedCase = normalizeSchema(selectedRaw, deref, refStack);
    const selectedCaseSchema = normalizedCase.circular
      ? normalizedCase.schema
      : flattenAllOf(normalizedCase.schema, deref, refStack);
    const isLeafCase =
      !normalizedCase.circular && isLeafItemSchema(selectedCaseSchema);

    const caseContent = isLeafCase ? (
      <SchemaCaseDetail schema={selectedCaseSchema} showBorder={false} />
    ) : (
      <SchemaNode
        key={selectedCase}
        schema={selectedRaw}
        path={path}
        depth={caseDepth}
        refStack={refStack}
        deref={deref}
        suppressRow
      />
    );

    const unionBranch = (
      <SchemaUnionBranch
        variant={unionVariant}
        caseCount={unionItems.length}
        caseLabels={caseLabels}
        selectedCase={selectedCase}
        onSelectCase={setSelectedCase}
      >
        {caseContent}
      </SchemaUnionBranch>
    );

    if (suppressRow) {
      return unionBranch;
    }

    return (
      <>
        <SchemaTreeRow
          path={path}
          depth={depth}
          typeLabel={getTypeLabel(schema, refLabel)}
          refLabel={refLabel}
          required={required}
          description={schema.description}
          expandable
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        {expanded && (
          <SchemaTreeBranch depth={depth}>{unionBranch}</SchemaTreeBranch>
        )}
      </>
    );
  }

  const properties = schema.properties;
  const hasProperties =
    properties !== undefined && Object.keys(properties).length > 0;

  if (hasProperties) {
    const requiredFields = new Set(schema.required ?? []);
    const typeLabel = getTypeLabel(schema, refLabel);

    if (suppressRow) {
      return (
        <>
          <div
            className="flex items-center gap-1.5 py-2 px-1 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors cursor-pointer text-xs text-gray-400 hover:text-gray-600"
            onClick={() => setExpanded((v) => !v)}
          >
            <ExpandToggle
              depth={0}
              expanded={expanded}
              onToggle={() => setExpanded((v) => !v)}
            />
            <span>{expanded ? "Hide properties" : "Show properties"}</span>
          </div>
          {/* i had to put this pl-1 due to the px-1 required in the div above this */}
          <div className="pl-1">
            {expanded && (
              <SchemaTreeBranch depth={0}>
                {Object.entries(properties).map(([name, prop]) => {
                  if (!isSchemaRecord(prop)) return null;
                  return (
                    <SchemaNode
                      key={name}
                      schema={prop}
                      path={`${path}.${name}`}
                      depth={1}
                      required={requiredFields.has(name)}
                      refStack={refStack}
                      deref={deref}
                    />
                  );
                })}
              </SchemaTreeBranch>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <SchemaTreeRow
          path={path}
          depth={depth}
          typeLabel={typeLabel}
          refLabel={refLabel}
          required={required}
          description={schema.description}
          expandable
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        {expanded && (
          <SchemaTreeBranch depth={depth}>
            {Object.entries(properties).map(([name, prop]) => {
              if (!isSchemaRecord(prop)) return null;
              return (
                <SchemaNode
                  key={name}
                  schema={prop}
                  path={`${path}.${name}`}
                  depth={depth + 1}
                  required={requiredFields.has(name)}
                  refStack={refStack}
                  deref={deref}
                />
              );
            })}
          </SchemaTreeBranch>
        )}
      </>
    );
  }

  if (schema.type === "array" || schema.items) {
    const itemSchema = getItemSchema(schema);
    const hasItem = itemSchema !== null;
    const arrayPath = `${path}[]`;
    const typeLabel = getTypeLabel(schema, refLabel);

    const resolvedItem = hasItem
      ? flattenAllOf(
        normalizeSchema(itemSchema, deref, refStack).schema,
        deref,
        refStack
      )
      : null;
    const isLeafArray = resolvedItem !== null && isLeafItemSchema(resolvedItem);
    const itemProperties =
      resolvedItem?.properties
        ? Object.entries(resolvedItem.properties).filter(([, prop]) =>
          isSchemaRecord(prop)
        )
        : [];
    const itemRequired = new Set(
      resolvedItem && Array.isArray(resolvedItem.required)
        ? resolvedItem.required
        : []
    );

    if (isLeafArray) {
      return (
        <SchemaTreeRow
          path={arrayPath}
          depth={depth}
          typeLabel={typeLabel}
          refLabel={refLabel}
          required={required}
          description={mergeDescriptions(schema.description, resolvedItem.description)}
          expandable={false}
          expanded={false}
          onToggle={() => undefined}
        />
      );
    }

    if (suppressRow) {
      return (
        <>
          <div className="py-2">
            <ExpandToggle
              depth={0}
              expanded={expanded}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
          {expanded && hasItem && (
            <SchemaTreeBranch depth={1}>
              {itemProperties.length > 0
                ? itemProperties.map(([name, prop]) => (
                  <SchemaNode
                    key={name}
                    schema={prop}
                    path={`${path}[].${name}`}
                    depth={1}
                    required={itemRequired.has(name)}
                    refStack={refStack}
                    deref={deref}
                  />
                ))
                : (
                  <SchemaNode
                    schema={itemSchema!}
                    path={arrayPath}
                    depth={1}
                    refStack={refStack}
                    deref={deref}
                  />
                )}
            </SchemaTreeBranch>
          )}
        </>
      );
    }

    return (
      <>
        <SchemaTreeRow
          path={arrayPath}
          depth={depth}
          typeLabel={typeLabel}
          refLabel={refLabel}
          required={required}
          description={schema.description}
          expandable={hasItem}
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        {expanded && hasItem && (
          <SchemaTreeBranch depth={depth}>
            {itemProperties.length > 0 ? (
              itemProperties.map(([name, prop]) => (
                <SchemaNode
                  key={name}
                  schema={prop}
                  path={`${path}[].${name}`}
                  depth={depth + 1}
                  required={itemRequired.has(name)}
                  refStack={refStack}
                  deref={deref}
                />
              ))
            ) : (
              <SchemaNode
                schema={itemSchema!}
                path={arrayPath}
                depth={depth + 1}
                refStack={refStack}
                deref={deref}
              />
            )}
          </SchemaTreeBranch>
        )}
      </>
    );
  }

  // Leaf — when root is suppressed and name is shown externally, render nothing.
  if (suppressRow) return null;

  return (
    <SchemaTreeRow
      path={path}
      depth={depth}
      typeLabel={getTypeLabel(schema, refLabel)}
      refLabel={refLabel}
      required={required}
      description={schema.description}
      expandable={false}
      expanded={false}
      onToggle={() => undefined}
    />
  );
}
