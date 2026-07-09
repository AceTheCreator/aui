import { useState } from "react";
import { SchemaViewer } from "../../containers/Schema/SchemaViewer";
import SchemaTree from "./SchemaTree";
import TabToggle from "../TabToggle";
import { Examples } from "../Examples";

function SchemaTabs({
  schema,
  label,
  description,
}: {
  schema: unknown;
  label: string;
  description?: string;
}) {
  const [tab, setTab] = useState<"schema" | "json" | "example">("schema");

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {label}
          </p>
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
            { id: "example", label: "Example" },
          ]}
          selected={tab}
          onChange={(id) => setTab(id as "schema" | "json" | "example")}
          ariaLabel="Schema view toggle"
        />
      </div>
      {tab === "schema" && <SchemaTree schema={schema} rootName={label} />}
      {tab === "json" && <SchemaViewer schema={schema} />}
      {tab === "example" && <Examples schema={schema} />}
    </div>
  );
}

export default SchemaTabs;
