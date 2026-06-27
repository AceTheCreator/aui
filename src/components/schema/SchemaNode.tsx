import React, { useMemo, useState } from "react";
import { isSchemaRecord, SchemaNodeData } from "../../types/schema";
import SchemaCaseDetail from "./SchemaCaseDetail";
import SchemaNotBranch, { BooleanNotPill } from "./SchemaNotBranch";
import SchemaUnionBranch from "./SchemaUnionBranch";
import SchemaTreeBranch, {
  type SchemaTreeBranchLineVariant,
} from "./SchemaTreeBranch";
import SchemaTreeRow from "./SchemaTreeRow";
import {
  flattenAllOf,
  getAdditionalItemsSchema,
  getAdditionalPropertiesSchema,
  getAllOfConditionals,
  getAnyOfItems,
  getContainsSchema,
  getItemSchema,
  getNotSchema,
  getOneOfItems,
  getPatternPropertiesEntries,
  getPropertyNamesSchema,
  getSubschema,
  getTupleItemSchemas,
  hasAllOfConditionals,
  hasExplicitProperties,
  hasIfThenElse,
  hasNotSchema,
  hasObjectMapContent,
  hasStructuralShape,
  isLeafItemSchema,
  mergeDescriptions,
  normalizeSchema,
  omitIfThenElse,
  omitNot,
  patternPropertyPath,
} from "./schemaUtils";
import SchemaIfThenElseBranch from "./SchemaIfThenElseBranch";
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
  /** Left border style for nested branches; muted uses a grey dotted line. */
  branchLineVariant?: SchemaTreeBranchLineVariant;
}

/** Nested nodes inside a branch-line-less wrapper regain depth-colored lines. */
const childBranchLineVariant = (
  variant: SchemaTreeBranchLineVariant
): SchemaTreeBranchLineVariant => (variant === "none" ? "depth" : variant);

/** Full-row expand/collapse toggle used only at depth 0 when the root row is suppressed. */
function RootExpandToggle({
  expanded,
  onToggle,
  hideLabel,
  showLabel,
  branchLineVariant,
  children,
}: {
  expanded: boolean;
  onToggle: () => void;
  hideLabel: string;
  showLabel: string;
  branchLineVariant: SchemaTreeBranchLineVariant;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="flex items-center gap-1.5 py-2 px-1 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors cursor-pointer text-xs text-gray-400 hover:text-gray-600"
      >
        <span
          aria-hidden="true"
          className="shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] leading-none font-bold border-gray-300 text-gray-400"
        >
          {expanded ? "−" : "+"}
        </span>
        <span>{expanded ? hideLabel : showLabel}</span>
      </div>
      <div className="pl-1">
        {expanded && (
          <SchemaTreeBranch depth={0} lineVariant={branchLineVariant}>
            {children}
          </SchemaTreeBranch>
        )}
      </div>
    </>
  );
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
  branchLineVariant = "depth",
}: SchemaNodeProps) {
  const nestedBranchLineVariant = childBranchLineVariant(branchLineVariant);
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

  // Strip logical operators before shape detection so they don't mask the true structure.
  const structuralSchema = omitNot(omitIfThenElse(schema));
  // True when the schema carries only logical operators with no displayable structural shape
  // (no type, properties, items, oneOf, anyOf). These render as just a row + meta children.
  const isMetaOnly =
    !hasStructuralShape(structuralSchema) &&
    (hasNotSchema(schema) || hasIfThenElse(schema) || hasAllOfConditionals(schema));

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
            branchLineVariant={nestedBranchLineVariant}
          />
        )}
      </SchemaNotBranch>
    );
  };

  const renderIfThenElseBranchSchema = (
    branchSchema: SchemaNodeData | boolean,
    branchPath: string
  ) => {
    if (typeof branchSchema === "boolean") {
      return (
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          {branchSchema ? "any value" : "false schema"}
        </span>
      );
    }
    const normalized = normalizeSchema(branchSchema, deref, refStack);
    if (normalized.circular) {
      return (
        <SchemaTreeRow
          path={branchPath}
          depth={depth + 1}
          typeLabelOverride={`↩ ${branchSchema.$ref}`}
          expandable={false}
          expanded={false}
          onToggle={() => undefined}
          showBorder={false}
        />
      );
    }
    const flattened = flattenAllOf(normalized.schema, deref, refStack);
    if (isLeafItemSchema(flattened)) {
      return <SchemaCaseDetail schema={flattened} showBorder={false} />;
    }
    return (
      <SchemaNode
        schema={branchSchema}
        path={branchPath}
        depth={depth + 1}
        refStack={refStack}
        deref={deref}
        suppressRow
        branchLineVariant="none"
      />
    );
  };

  /**
   * Renders a single if/then/else as a consolidated card with labeled sections.
   * Nested if/then/else in an else branch is handled automatically: renderIfThenElseBranchSchema
   * passes the else schema to SchemaNode, which detects hasIfThenElse and re-enters here,
   * producing a nested card inside the Else: section.
   */
  const renderSingleIfThenElse = (condSchema: SchemaNodeData) => {
    const ifVal = getSubschema(condSchema.if);
    if (ifVal === null) return null;
    const thenVal = getSubschema(condSchema.then);
    const elseVal = getSubschema(condSchema.else);
    return (
      <SchemaIfThenElseBranch
        ifContent={renderIfThenElseBranchSchema(ifVal, path)}
        thenContent={thenVal !== null ? renderIfThenElseBranchSchema(thenVal, path) : undefined}
        elseContent={elseVal !== null ? renderIfThenElseBranchSchema(elseVal, path) : undefined}
      />
    );
  };


  const renderAllOfConditionals = () => {
    const conditionals = getAllOfConditionals(schema);
    if (conditionals.length === 0) return null;
    return (
      <>
        {conditionals.map((cond, idx) => (
          <div key={idx}>
            {renderSingleIfThenElse(cond)}
          </div>
        ))}
      </>
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

  if (isMetaOnly) {
    const metaContent = (
      <>
        {hasNotSchema(schema) && renderNotSection()}
        {hasIfThenElse(schema) && renderSingleIfThenElse(schema)}
        {hasAllOfConditionals(schema) && renderAllOfConditionals()}
      </>
    );

    if (suppressRow) {
      return metaContent;
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
          <SchemaTreeBranch depth={depth} lineVariant={branchLineVariant}>
            {metaContent}
          </SchemaTreeBranch>
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
        depth={caseDepth - 1}
        refStack={refStack}
        deref={deref}
        suppressRow
        branchLineVariant="none"
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
        {hasIfThenElse(schema) && renderSingleIfThenElse(schema)}
        {hasAllOfConditionals(schema) && renderAllOfConditionals()}
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
          <SchemaTreeBranch depth={depth} lineVariant={branchLineVariant}>{unionContent}</SchemaTreeBranch>
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
        branchLineVariant={nestedBranchLineVariant}
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
              branchLineVariant={nestedBranchLineVariant}
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
              branchLineVariant={nestedBranchLineVariant}
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
        {hasIfThenElse(schema) && renderSingleIfThenElse(schema)}
        {hasAllOfConditionals(schema) && renderAllOfConditionals()}
      </>
    );
  };

  const hasObjectChildren =
    hasExplicitProperties(structuralSchema) || hasObjectMapContent(structuralSchema);

  if (hasObjectChildren) {
    if (suppressRow) {
      if (depth === 0) {
        return (
          <RootExpandToggle
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
            hideLabel="Hide properties"
            showLabel="Show properties"
            branchLineVariant={branchLineVariant}
          >
            {renderObjectChildren(1)}
          </RootExpandToggle>
        );
      }
      return (
        <SchemaTreeBranch depth={depth} lineVariant={branchLineVariant}>
          {renderObjectChildren(depth + 1)}
        </SchemaTreeBranch>
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
          <SchemaTreeBranch depth={depth} lineVariant={branchLineVariant}>
            {renderObjectChildren(depth + 1)}
          </SchemaTreeBranch>
        )}
      </>
    );
  }

  if (structuralSchema.type === "array" || structuralSchema.items) {
    const tupleSchemas = getTupleItemSchemas(structuralSchema);
    const isTuple = tupleSchemas !== null;
    const additionalItemsSchema = isTuple ? getAdditionalItemsSchema(structuralSchema) : null;
    const containsSchema = getContainsSchema(structuralSchema);
    const hasContainsSchema = containsSchema !== null;

    const itemSchema = isTuple ? null : getItemSchema(structuralSchema);
    const hasItem = itemSchema !== null;
    // Guards the suppressRow toggle — prevents rendering an expand button for empty arrays.
    const hasArrayContent =
      isTuple || hasItem || hasContainsSchema ||
      hasNotSchema(schema) || hasIfThenElse(schema) || hasAllOfConditionals(schema);
    const arrayPath = `${path}[]`;

    const resolvedItem = hasItem
      ? flattenAllOf(
          normalizeSchema(itemSchema, deref, refStack).schema,
          deref,
          refStack
        )
      : null;
    const isLeafArray =
      !isTuple &&
      !hasContainsSchema &&
      resolvedItem !== null &&
      isLeafItemSchema(resolvedItem);
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

    const renderArrayExpansion = (childDepth: number) => (
      <>
        {isTuple ? (
          <>
            {tupleSchemas.map((itemSch, idx) => (
              <SchemaNode
                key={idx}
                schema={itemSch}
                path={`${path}[${idx}]`}
                depth={childDepth}
                refStack={refStack}
                deref={deref}
                branchLineVariant={nestedBranchLineVariant}
              />
            ))}
            {additionalItemsSchema !== null &&
              typeof additionalItemsSchema !== "boolean" && (
                <SchemaMapBranch label="Additional items:">
                  {renderMapSubschema(
                    additionalItemsSchema,
                    `${path}[*]`,
                    childDepth
                  )}
                </SchemaMapBranch>
              )}
            {additionalItemsSchema === false && (
              <div className="py-1 pl-6 text-xs text-gray-400">
                no additional items allowed
              </div>
            )}
          </>
        ) : (
          hasItem &&
          (itemProperties.length > 0
            ? itemProperties.map(([name, prop]) => (
                <SchemaNode
                  key={name}
                  schema={prop}
                  path={`${path}[].${name}`}
                  depth={childDepth}
                  required={itemRequired.has(name)}
                  refStack={refStack}
                  deref={deref}
                  branchLineVariant={nestedBranchLineVariant}
                />
              ))
            : (
                <SchemaNode
                  schema={itemSchema!}
                  path={arrayPath}
                  depth={childDepth}
                  refStack={refStack}
                  deref={deref}
                  branchLineVariant={nestedBranchLineVariant}
                />
              ))
        )}
        {hasContainsSchema && (
          <SchemaMapBranch label="Contains at least one:">
            {/* boolean contains: true → any item qualifies, false → impossible constraint */}
            {typeof containsSchema === "boolean" ? (
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                {containsSchema ? "any item" : "impossible constraint"}
              </span>
            ) : (
              renderMapSubschema(containsSchema!, `${path}[contains]`, childDepth)
            )}
          </SchemaMapBranch>
        )}
        {hasNotSchema(schema) && renderNotSection()}
        {hasIfThenElse(schema) && renderSingleIfThenElse(schema)}
        {hasAllOfConditionals(schema) && renderAllOfConditionals()}
      </>
    );

    if (isLeafArray && !hasNotSchema(schema) && !hasIfThenElse(schema) && !hasAllOfConditionals(schema)) {
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
            resolvedItem!.description
          )}
          expandable={false}
          expanded={false}
          onToggle={() => undefined}
        />
      );
    }

    if (isLeafArray) {
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
              resolvedItem!.description
            )}
            expandable
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
          />
          {expanded && (
            <SchemaTreeBranch depth={depth} lineVariant={branchLineVariant}>
              {hasNotSchema(schema) && renderNotSection()}
              {hasIfThenElse(schema) && renderSingleIfThenElse(schema)}
              {hasAllOfConditionals(schema) && renderAllOfConditionals()}
            </SchemaTreeBranch>
          )}
        </>
      );
    }

    if (suppressRow) {
      // Render nothing for bare { type:'array' } with no items/contains/conditionals.
      if (!hasArrayContent) return null;
      if (depth === 0) {
        return (
          <RootExpandToggle
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
            hideLabel="Hide items"
            showLabel="Show items"
            branchLineVariant={branchLineVariant}
          >
            {renderArrayExpansion(1)}
          </RootExpandToggle>
        );
      }
      return (
        <SchemaTreeBranch depth={depth} lineVariant={branchLineVariant}>
          {renderArrayExpansion(depth + 1)}
        </SchemaTreeBranch>
      );
    }

    return (
      <>
        <SchemaTreeRow
          path={arrayPath}
          depth={depth}
          schema={schema}
          itemSchema={resolvedItem}
          refLabel={refLabel}
          required={required}
          description={schema.description}
          expandable={
            isTuple ||
            hasItem ||
            hasContainsSchema ||
            hasNotSchema(schema) ||
            hasIfThenElse(schema) ||
            hasAllOfConditionals(schema)
          }
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        {expanded && (
          <SchemaTreeBranch depth={depth} lineVariant={branchLineVariant}>
            {renderArrayExpansion(depth + 1)}
          </SchemaTreeBranch>
        )}
      </>
    );
  }

  // Scalar (or otherwise typed) schemas that also carry logical operators but weren't
  // caught by the object/array/union branches above — e.g. { type: "string", if: … }.
  if (hasNotSchema(schema) || hasIfThenElse(schema) || hasAllOfConditionals(schema)) {
    const metaOnlyContent = (
      <>
        {hasNotSchema(schema) && renderNotSection()}
        {hasIfThenElse(schema) && renderSingleIfThenElse(schema)}
        {hasAllOfConditionals(schema) && renderAllOfConditionals()}
      </>
    );

    if (suppressRow) {
      return metaOnlyContent;
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
          <SchemaTreeBranch depth={depth} lineVariant={branchLineVariant}>
            {metaOnlyContent}
          </SchemaTreeBranch>
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
