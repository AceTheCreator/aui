import SchemaTree from "../../components/schema/SchemaTree";
import Section from "../../components/Section";
import { SchemaNodeData } from "../../types/schema";

interface SchemasProps {
  /** Map of schema name → schema definition (from `asyncapi.components.schemas`). */
  schemas: Record<string, SchemaNodeData>;
}

// Renders the Schemas tab: lists every reusable schema defined under `components.schemas`
export default function Schemas({ schemas }: SchemasProps) {
  const schemaEntries = Object.entries(schemas);

  const content = schemaEntries.length ? (
    <div className="mt-10 grid gap-6">
      {schemaEntries.map(([schemaName, schema]) => {
        // Top-level property count only.
        // IMP: Nested properties are not expanded here .
        const propertyCount = schema.properties
          ? Object.keys(schema.properties).length
          : 0;

        return (
          <article
            key={schemaName}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {schemaName}
                </h3>
                {schema.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {schema.description}
                  </p>
                )}
              </div>
              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                {schema.type ?? "unknown"}
              </span>
            </div>
            {(schema.format || propertyCount > 0) && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                {schema.format && (
                  <span className="rounded-full bg-gray-100 px-3 py-1">
                    Format: {schema.format}
                  </span>
                )}
                {propertyCount > 0 && (
                  <span className="rounded-full bg-gray-100 px-3 py-1">
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
    <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
      No schemas defined in this AsyncAPI document.
    </div>
  );

  return (
    <div className="container">
      <Section content={content} stickySideContent={false} />
    </div>
  );
}
