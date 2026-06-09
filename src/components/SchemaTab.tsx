import { useState } from "react";

interface SchemaProperty {
  type?: string;
  description?: string;
  enum?: string[];
}

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

  const obj = schema as Record<string, unknown>;
  const isRef = "$ref" in obj;
  const properties = obj.properties as
    | Record<string, SchemaProperty>
    | undefined;

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
        <pre className="text-xs bg-gray-50 text-gray-700 p-2 rounded overflow-x-auto">
          {JSON.stringify(schema, null, 2)}
        </pre>
      ) : isRef ? (
        <p className="text-xs text-gray-500 italic">
          Referenced schema:{" "}
          <code className="bg-gray-100 px-1 rounded">
            {obj["$ref"] as string}
          </code>
        </p>
      ) : properties ? (
        <div className="divide-y divide-gray-100 border border-gray-100 rounded">
          {Object.entries(properties).map(([name, prop]) => (
            <div key={name} className="flex items-start gap-2 px-3 py-2">
              <code className="text-xs font-semibold text-gray-800 shrink-0">
                {name}
              </code>
              {prop.type && (
                <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded shrink-0">
                  {prop.type}
                </span>
              )}
              {prop.description && (
                <p className="text-xs text-gray-500 leading-relaxed">
                  {prop.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">
          No schema details available.
        </p>
      )}
    </div>
  );
}

export default SchemaTabs;
