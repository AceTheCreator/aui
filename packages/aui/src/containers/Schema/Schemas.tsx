import SchemaTree from "../../components/schema/SchemaTree";
import Section from "../../components/Section";
import { SchemaNodeData } from "../../types/schema";

interface SchemasProps {
  schemas: Record<string, SchemaNodeData>;
  selectedKey?: string | null;
}

export default function Schemas({ schemas, selectedKey }: SchemasProps) {
  const schemaEntries = Object.entries(schemas);

  const content = schemaEntries.length ? (
    <div className="grid gap-6 w-full">
      {schemaEntries.map(([schemaName, schema]) => {
        // Top-level property count only.
        // IMP: Nested properties are not expanded here .
        const propertyCount = schema.properties
          ? Object.keys(schema.properties).length
          : 0;

        return (
          <article
            key={schemaName}
            id={`schema-${schemaName}`}
            className={`rounded-xl border bg-surface p-5 shadow-sm transition-colors ${
              selectedKey === schemaName ? "border-primary-300 ring-1 ring-primary-200" : "border-border"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {schemaName}
                </h3>
                {schema.description && (
                  <p className="mt-1 text-sm text-foreground-secondary">
                    {schema.description}
                  </p>
                )}
              </div>
              <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground-secondary">
                {schema.type ?? "unknown"}
              </span>
            </div>
            {(schema.format || propertyCount > 0) && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground-secondary">
                {schema.format && (
                  <span className="rounded-full bg-neutral-100 px-3 py-1">
                    Format: {schema.format}
                  </span>
                )}
                {propertyCount > 0 && (
                  <span className="rounded-full bg-neutral-100 px-3 py-1">
                    {propertyCount} properties
                  </span>
                )}
              </div>
            )}
            <SchemaTree schema={schema} rootName={schemaName} className="mt-4" />
          </article>
        );
      })}
    </div>
  ) : (
    <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-surface p-8 text-center text-sm text-foreground-muted">
      No schemas defined in this AsyncAPI document.
    </div>
  );

  return (
    <div className="flex justify-center w-full">
      <Section content={content} stickySideContent={false} />
    </div>
  );
}
