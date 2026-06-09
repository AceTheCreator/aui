import { useState } from "react";
import TagComponent from "../../components/Tag";
import Tabs from "../../components/Tabs";
import { MessageObject } from "../../types/asyncapi/MessageObject";
import { Tag } from "../../types/asyncapi/Tag";
import SchemaTabs from "../../components/SchemaTab";

interface MessageProps {
  message: MessageObject;
  i: number;
}

export function Message({ message, i }: MessageProps) {
  const [expanded, setExpanded] = useState(false);
  const [schemaTab, setSchemaTab] = useState<"payload" | "headers">("headers");

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
                {(schemaTab === "headers" || !message.payload) &&
                  message.headers && (
                    <SchemaTabs schema={message.headers} label="Headers" />
                  )}
                {(schemaTab === "payload" || !message.headers) &&
                  message.payload && (
                    <SchemaTabs
                      schema={message.payload}
                      label="Payload"
                      description={message.payload?.description}
                    />
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
