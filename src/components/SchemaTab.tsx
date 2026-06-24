import { Suspense, useState } from "react";
import { SchemaViewer } from "../containers/Schema/SchemaViewer";
import { Examples } from "./Examples";

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
  const [tab, setTab] = useState<"schema" | "json" | "examples">("schema");

  const obj = schema as Record<string, unknown>;
  const isRef = "$ref" in obj;
  const properties = obj.properties as
    | Record<string, SchemaProperty>
    | undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            {label}
          </p>
          {description && (
            <p className="text-sm text-neutral-600 leading-relaxed mt-2 mb-2">
              {description}
            </p>
          )}
        </div>
        <div className="flex rounded overflow-hidden border border-neutral-200 text-xs">
          <button
            onClick={() => setTab("schema")}
            className={`px-2 py-0.5 ${tab === "schema" ? "bg-neutral-800 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50"}`}
          >
            Schema
          </button>
          <button
            onClick={() => setTab("json")}
            className={`px-2 py-0.5 border-l border-neutral-200 ${tab === "json" ? "bg-neutral-800 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50"}`}
          >
            JSON
          </button>
          <button
            onClick={() => setTab("examples")}
            className={`px-2 py-0.5 border-l border-neutral-200 ${tab === "examples" ? "bg-neutral-800 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50"}`}
          >
            Examples
          </button>
        </div>
      </div>

      {tab === "json" ? (
        <SchemaViewer schema={schema} />
      ) : tab === "examples" ? (
        <Suspense
          fallback={
            <div className="min-h-28 bg-neutral-50 p-2">
              <p className="text-xs text-neutral-400">Rendering examples...</p>
            </div>
          }
        >
          <Examples schema={schema} />
        </Suspense>
      ) : isRef ? (
        <p className="text-xs text-neutral-500 italic">
          Referenced schema:{" "}
          <code className="bg-neutral-100 px-1 rounded">
            {obj["$ref"] as string}
          </code>
        </p>
      ) : properties ? (
        <div className="divide-y divide-neutral-100 border border-neutral-100 rounded">
          {Object.entries(properties).map(([name, prop]) => (
            <div key={name} className="flex items-start gap-2 px-3 py-2">
              <code className="text-xs font-semibold text-neutral-800 shrink-0">
                {name}
              </code>
              {prop.type && (
                <span className="text-xs bg-secondary-50 text-secondary-600 px-1.5 py-0.5 rounded shrink-0">
                  {prop.type}
                </span>
              )}
              {prop.description && (
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {prop.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-400 italic">
          No schema details available.
        </p>
      )}
    </div>
  );
}

export default SchemaTabs;
