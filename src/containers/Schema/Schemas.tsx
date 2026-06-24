import Section from "../../components/Section";

interface SchemaDefinition {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

interface SchemasProps {
  schemas: Record<string, unknown>;
  selectedKey?: string | null;
}

export default function Schemas({ schemas, selectedKey }: SchemasProps) {
  const schemaEntries = Object.entries(schemas) as [string, SchemaDefinition][];

  const content = schemaEntries.length ? (
    <div className="mt-10 grid gap-6">
      {schemaEntries.map(([schemaName, schema]) => {
        const propertyCount = schema.properties
          ? Object.keys(schema.properties).length
          : 0;

        return (
          <article
            key={schemaName}
            id={`schema-${schemaName}`}
            className={`rounded-xl border bg-white p-5 shadow-sm transition-colors ${
              selectedKey === schemaName ? "border-primary-300 ring-1 ring-primary-200" : "border-neutral-200"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {schemaName}
                </h3>
                {schema.description && (
                  <p className="mt-1 text-sm text-neutral-600">
                    {schema.description}
                  </p>
                )}
              </div>
              <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">
                {schema.type ?? "unknown"}
              </span>
            </div>
            {(schema.format || propertyCount > 0) && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-600">
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
            <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-6 text-slate-100">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </article>
        );
      })}
    </div>
  ) : (
    <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
      No schemas defined in this AsyncAPI document.
    </div>
  );

  return (
    <div className="container">
      <Section content={content} stickySideContent={false} />
    </div>
  );
}
