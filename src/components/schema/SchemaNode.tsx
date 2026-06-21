import { useMemo, useState } from "react";
import { isSchemaRecord, SchemaNodeData } from "../../types/schema";
import ExpandToggle from "./ExpandToggle";
import SchemaCaseDetail from "./SchemaCaseDetail";
import SchemaNotBranch, { BooleanNotPill } from "./SchemaNotBranch";
import SchemaUnionBranch from "./SchemaUnionBranch";
import SchemaTreeBranch from "./SchemaTreeBranch";
import SchemaTreeRow from "./SchemaTreeRow";
import {
  flattenAllOf,
  getAdditionalPropertiesSchema,
  getAnyOfItems,
  getItemSchema,
  getNotSchema,
  getOneOfItems,
  getPatternPropertiesEntries,
  getPropertyNamesSchema,
  hasExplicitProperties,
  hasNotSchema,
  hasObjectMapContent,
  hasStructuralShape,
  isLeafItemSchema,
  mergeDescriptions,
  normalizeSchema,
  omitNot,
  patternPropertyPath,
} from "./schemaUtils";
import SchemaMapBranch from "./SchemaMapBranch";

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

  const structuralSchema = omitNot(schema);
  const isNotOnly = hasNotSchema(schema) && !hasStructuralShape(structuralSchema);

  const renderNotSection = () => {
    const notValue = getNotSchema(schema);
    if (notValue === null) return null;

    if (typeof notValue === "boolean") {
      return (
        <SchemaNotBranch>
          <BooleanNotPill value={notValue} />
        </SchemaNotBranch>
      );
    }

    const normalizedNot = normalizeSchema(notValue, deref, refStack);
    if (normalizedNot.circular) {
      return (
        <SchemaNotBranch>
          <SchemaTreeRow
            path={path}
            depth={depth + 1}
            typeLabelOverride={`↩ ${notValue.$ref}`}
            expandable={false}
            expanded={false}
            onToggle={() => undefined}
            showBorder={false}
          />
        </SchemaNotBranch>
      );
    }

    const flattenedNot = flattenAllOf(normalizedNot.schema, deref, refStack);
    const isLeafNot = isLeafItemSchema(flattenedNot);

    return (
      <SchemaNotBranch>
        {isLeafNot ? (
          <SchemaCaseDetail schema={flattenedNot} showBorder={false} />
        ) : (
          <SchemaNode
            schema={notValue}
            path={path}
            depth={depth + 1}
            refStack={refStack}
            deref={deref}
            suppressRow
          />
        )}
      </SchemaNotBranch>
    );
  };

  if (circular) {
    return (
      <SchemaTreeRow
        path={path}
        depth={depth}
        typeLabelOverride={`↩ ${rawSchema.$ref}`}
        expandable={false}
        expanded={false}
        onToggle={() => undefined}
      />
    );
  }

  if (isNotOnly) {
    if (suppressRow) {
      return renderNotSection();
    }

    return (
      <>
        <SchemaTreeRow
          path={path}
          depth={depth}
          schema={schema}
          refLabel={refLabel}
          required={required}
          description={schema.description}
          expandable
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        {expanded && (
          <SchemaTreeBranch depth={depth}>{renderNotSection()}</SchemaTreeBranch>
        )}
      </>
    );
  }

  const oneOfItems = getOneOfItems(structuralSchema);
  const anyOfItems = getAnyOfItems(structuralSchema);
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

    const unionContent = (
      <>
        {unionBranch}
        {hasNotSchema(schema) && renderNotSection()}
      </>
    );

    if (suppressRow) {
      return unionContent;
    }

    return (
      <>
        <SchemaTreeRow
          path={path}
          depth={depth}
          schema={schema}
          refLabel={refLabel}
          required={required}
          description={schema.description}
          expandable
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        {expanded && (
          <SchemaTreeBranch depth={depth}>{unionContent}</SchemaTreeBranch>
        )}
      </>
    );
  }

  const renderMapSubschema = (
    mapSchema: SchemaNodeData,
    mapPath: string,
    mapDepth: number
  ) => {
    const normalizedMap = normalizeSchema(mapSchema, deref, refStack);
    if (normalizedMap.circular) {
      return (
        <SchemaTreeRow
          path={mapPath}
          depth={mapDepth}
          typeLabelOverride={`↩ ${mapSchema.$ref}`}
          expandable={false}
          expanded={false}
          onToggle={() => undefined}
          showBorder={false}
        />
      );
    }

    const flattenedMap = flattenAllOf(normalizedMap.schema, deref, refStack);
    if (isLeafItemSchema(flattenedMap)) {
      return <SchemaCaseDetail schema={flattenedMap} showBorder={false} />;
    }

    return (
      <SchemaNode
        schema={mapSchema}
        path={mapPath}
        depth={mapDepth}
        refStack={refStack}
        deref={deref}
      />
    );
  };

  const renderObjectChildren = (childDepth: number) => {
    const properties = structuralSchema.properties ?? {};
    const requiredFields = new Set(structuralSchema.required ?? []);
    const propertyNamesSchema = getPropertyNamesSchema(structuralSchema);
    const additionalPropertiesSchema =
      getAdditionalPropertiesSchema(structuralSchema);
    const patternEntries = getPatternPropertiesEntries(structuralSchema);

    return (
      <>
        {Object.entries(properties).map(([name, prop]) => {
          if (!isSchemaRecord(prop)) return null;
          return (
            <SchemaNode
              key={name}
              schema={prop}
              path={`${path}.${name}`}
              depth={childDepth}
              required={requiredFields.has(name)}
              refStack={refStack}
              deref={deref}
            />
          );
        })}
        {propertyNamesSchema !== null &&
          isSchemaRecord(propertyNamesSchema) && (
            <SchemaMapBranch label="Property names must adhere to:">
              {renderMapSubschema(
                propertyNamesSchema,
                `${path}.[propertyName]`,
                childDepth
              )}
            </SchemaMapBranch>
          )}
        {patternEntries.map(([pattern, subSchema]) => (
          <SchemaNode
            key={pattern}
            schema={subSchema}
            path={patternPropertyPath(path, pattern)}
            depth={childDepth}
            refStack={refStack}
            deref={deref}
          />
        ))}
        {additionalPropertiesSchema !== null &&
          isSchemaRecord(additionalPropertiesSchema) && (
            <SchemaMapBranch label="Additional properties must adhere to:">
              {renderMapSubschema(
                additionalPropertiesSchema,
                `${path}.[additionalProperty]`,
                childDepth
              )}
            </SchemaMapBranch>
          )}
        {hasNotSchema(schema) && renderNotSection()}
      </>
    );
  };

  const hasObjectChildren =
    hasExplicitProperties(structuralSchema) || hasObjectMapContent(structuralSchema);

  if (hasObjectChildren) {
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
          <div className="pl-1">
            {expanded && (
              <SchemaTreeBranch depth={0}>
                {renderObjectChildren(1)}
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
          schema={schema}
          refLabel={refLabel}
          required={required}
          description={schema.description}
          expandable
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        {expanded && (
          <SchemaTreeBranch depth={depth}>
            {renderObjectChildren(depth + 1)}
          </SchemaTreeBranch>
        )}
      </>
    );
  }

  if (structuralSchema.type === "array" || structuralSchema.items) {
    const itemSchema = getItemSchema(structuralSchema);
    const hasItem = itemSchema !== null;
    const arrayPath = `${path}[]`;

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

    if (isLeafArray && !hasNotSchema(schema)) {
      return (
        <SchemaTreeRow
          path={arrayPath}
          depth={depth}
          schema={schema}
          itemSchema={resolvedItem}
          refLabel={refLabel}
          required={required}
          description={mergeDescriptions(
            schema.description,
            resolvedItem.description
          )}
          expandable={false}
          expanded={false}
          onToggle={() => undefined}
        />
      );
    }

    if (isLeafArray && hasNotSchema(schema)) {
      return (
        <>
          <SchemaTreeRow
            path={arrayPath}
            depth={depth}
            schema={schema}
            itemSchema={resolvedItem}
            refLabel={refLabel}
            required={required}
            description={mergeDescriptions(
              schema.description,
              resolvedItem.description
            )}
            expandable
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
          />
          {expanded && (
            <SchemaTreeBranch depth={depth}>{renderNotSection()}</SchemaTreeBranch>
          )}
        </>
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
              {hasNotSchema(schema) && renderNotSection()}
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
          schema={schema}
          refLabel={refLabel}
          required={required}
          description={schema.description}
          expandable={hasItem || hasNotSchema(schema)}
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        {expanded && (
          <SchemaTreeBranch depth={depth}>
            {hasItem &&
              (itemProperties.length > 0 ? (
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
              ))}
            {hasNotSchema(schema) && renderNotSection()}
          </SchemaTreeBranch>
        )}
      </>
    );
  }

  if (hasNotSchema(schema)) {
    if (suppressRow) {
      return renderNotSection();
    }

    return (
      <>
        <SchemaTreeRow
          path={path}
          depth={depth}
          schema={schema}
          refLabel={refLabel}
          required={required}
          description={schema.description}
          expandable
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        {expanded && (
          <SchemaTreeBranch depth={depth}>{renderNotSection()}</SchemaTreeBranch>
        )}
      </>
    );
  }

  if (suppressRow) return null;

  return (
    <SchemaTreeRow
      path={path}
      depth={depth}
      schema={schema}
      refLabel={refLabel}
      required={required}
      description={schema.description}
      expandable={false}
      expanded={false}
      onToggle={() => undefined}
    />
  );
}
