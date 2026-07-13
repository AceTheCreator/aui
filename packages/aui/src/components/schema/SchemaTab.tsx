import { useState } from "react";
import { SchemaViewer } from "../../containers/Schema/SchemaViewer";
import SchemaTree from "./SchemaTree";
import TabToggle from "../TabToggle";
import { Examples } from "../Examples";
import { schemaFormatBadge } from "../../helpers/schemaFormat";

function SchemaTabs({
  schema,
  label,
  description,
  schemaFormat,
  originalSchema,
  conversionError,
}: {
  schema: unknown;
  label: string;
  description?: string;
  schemaFormat?: string;
  originalSchema?: unknown;
  conversionError?: string;
}) {
  const [tab, setTab] = useState<"schema" | "json" | "example">("schema");
  const formatBadge = schemaFormatBadge(schemaFormat);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {label}
            </p>
            {formatBadge && (
              <span
                className="text-xs font-mono bg-neutral-100 text-foreground-muted px-1.5 py-0.5 rounded"
                title={schemaFormat}
              >
                {formatBadge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed mt-2 mb-2">
              {description}
            </p>
          )}
        </div>
        <TabToggle
          tabs={[
            { id: "schema", label: "Schema" },
            { id: "json", label: "JSON" },
            // Generated examples need a converted schema; hide them when the
            // conversion failed and we only hold the raw definition.
            ...(conversionError ? [] : [{ id: "example", label: "Example" }]),
          ]}
          selected={tab}
          onChange={(id) => setTab(id as "schema" | "json" | "example")}
          ariaLabel="Schema view toggle"
        />
      </div>
      {conversionError && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mb-2">
          Could not convert Avro schema — showing raw definition.{" "}
          {conversionError}
        </p>
      )}
      {tab === "schema" && <SchemaTree schema={schema} rootName={label} />}
      {tab === "json" && (
        <SchemaViewer schema={originalSchema ?? schema} />
      )}
      {tab === "example" && !conversionError && <Examples schema={schema} />}
    </div>
  );
}

export default SchemaTabs;
