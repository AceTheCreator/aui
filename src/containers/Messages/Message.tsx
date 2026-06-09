import { useState } from "react";
import TagComponent from "../../components/Tag";
import Tabs from "../../components/Tabs";
import { MessageObject } from "../../types/asyncapi/MessageObject";
import { Tag } from "../../types/asyncapi/Tag";

interface SchemaProperty {
  type?: string;
  description?: string;
  enum?: string[];
}

function SchemaTabs({ schema, label, description }: { schema: unknown; label: string; description?: string }) {
  const [tab, setTab] = useState<"schema" | "json">("schema");

  const obj = schema as Record<string, unknown>;
  const isRef = "$ref" in obj;
  const properties = obj.properties as Record<string, SchemaProperty> | undefined;

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

interface MessageProps {
  message: MessageObject;
  i: number;
}

export function Message({ message, i }: MessageProps) {
  const [expanded, setExpanded] = useState(false);
  const [schemaTab, setSchemaTab] = useState<"payload" | "headers">("payload");

  const hasMore =
    message.description ||
    message.payload ||
    message.headers ||
    message.deprecated ||
    (message.tags && (message.tags as Tag[]).length > 0);

  return (
    <div className="border border-gray-200 rounded-md px-4 py-2.5">
      {/* Always visible */}
      <p className="text-xs font-medium text-gray-700">
        {message.title ?? message.name ?? `Message ${i + 1}`}
      </p>
      {message.summary && (
        <p className="text-xs text-gray-500 mt-2">{message.summary}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {message.contentType && (
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {message.contentType}
            </span>
          )}
          {message.deprecated && (
            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
              deprecated
            </span>
          )}
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          {message.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {message.description}
            </p>
          )}
          {(message.payload || message.headers) && (
            <div>
              {message.payload && message.headers ? (
                <Tabs
                  tabs={[
                    { id: "headers", name: "Headers" },
                    { id: "payload", name: "Payload" },
                  ]}
                  current={schemaTab}
                  onChange={(id) => setSchemaTab(id as "payload" | "headers")}
                />
              ) : null}
              <div className="mt-6">
                {(schemaTab === "payload" || !message.headers) &&
                  message.payload && (
                    <SchemaTabs
                      schema={message.payload}
                      label="Payload"
                      description={message.payload?.description}
                    />
                  )}
                {(schemaTab === "headers" || !message.payload) &&
                  message.headers && (
                    <SchemaTabs schema={message.headers} label="Headers" />
                  )}
              </div>
            </div>
          )}

          {message.tags && (message.tags as Tag[]).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(message.tags as Tag[]).map((tag, j) => (
                <TagComponent key={j} name={`#${tag.name}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
