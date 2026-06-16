import { useState } from "react";
import { SchemaViewer } from "../../containers/Schema/SchemaViewer";
import SchemaTree from "./SchemaTree";

function SchemaTabs({
  schema,
  label,
  description,
}: {
  schema: unknown;
  label: string;
  description?: string;
}) {
  const [tab, setTab] = useState<"schema" | "json">("schema");

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
        <div className="flex rounded overflow-hidden border border-gray-200 text-xs">
          <button
            onClick={() => setTab("schema")}
            className={`px-2 py-0.5 ${tab === "schema" ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            Schema
          </button>
          <button
            onClick={() => setTab("json")}
            className={`px-2 py-0.5 border-l border-gray-200 ${tab === "json" ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            JSON
          </button>
        </div>
      </div>

      {tab === "json" ? (
        <SchemaViewer schema={schema} />
      ) : (
        <SchemaTree schema={schema} rootName={label} />
      )}
    </div>
  );
}

export default SchemaTabs;
