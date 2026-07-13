import { useMemo, useState } from "react";
import IconArrowDown from "../../icons/ArrowDown";
import TagComponent from "../../components/Tag";
import Tabs from "../../components/Tabs";
import { MessageObject } from "../../types/asyncapi/MessageObject";
import { Tag } from "../../types/asyncapi/Tag";
import { CorrelationId } from "../../types/asyncapi/CorrelationId";
import SchemaTabs from "../../components/schema/SchemaTab";
import { resolveSchemaInput } from "../../helpers/schemaFormat";
import { useAsyncAPIDocument } from "../../contexts";

interface MessageProps {
  message: MessageObject;
  messageId?: string;
  i: number;
}

export function Message({ message, messageId, i }: MessageProps) {
  const [expanded, setExpanded] = useState(false);
  const [schemaTab, setSchemaTab] = useState<"payload" | "headers">("headers");
  const { deref } = useAsyncAPIDocument();

  const payload = useMemo(
    () => (message.payload ? resolveSchemaInput(message.payload, deref) : null),
    [message.payload, deref],
  );
  const headers = useMemo(
    () => (message.headers ? resolveSchemaInput(message.headers, deref) : null),
    [message.headers, deref],
  );

  const hasMore =
    message.description ||
    message.payload ||
    message.headers ||
    message.deprecated ||
    (message.tags && (message.tags as Tag[]).length > 0);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            {message.title ?? message.name ?? `Message ${i + 1}`}
          </p>
          {(messageId ?? message.name) && (
            <span className="text-xs font-mono bg-primary-50 text-primary-600 border border-primary-200 p-0.5 rounded shrink-0">
              {messageId ?? message.name}
            </span>
          )}
        </div>
        {message.summary && (
          <p className="text-xs text-foreground-muted mt-1.5 leading-relaxed">
            {message.summary}
          </p>
        )}

        <div className="flex items-center gap-1.5 shrink-0 mt-4">
          {message.contentType && (
            <span className="text-xs font-mono bg-neutral-100 text-foreground-muted px-1.5 py-0.5 rounded">
              {message.contentType}
            </span>
          )}
          {message.correlationId && (
            <span
              className="text-xs bg-secondary-50 text-secondary-500 px-1.5 py-0.5 rounded border border-secondary-200"
              title={
                (message.correlationId as CorrelationId).description ??
                (message.correlationId as CorrelationId).location
              }
            >
              {(message.correlationId as CorrelationId).location}
            </span>
          )}
          {message.deprecated && (
            <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-200">
              deprecated
            </span>
          )}
        </div>
      </div>

      {/* Expanded section */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
            {message.description && (
              <p className="text-sm text-foreground-secondary leading-relaxed">
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
                <div className="mt-4">
                  {(schemaTab === "headers" || !message.payload) && headers && (
                    <SchemaTabs
                      schema={headers.schema}
                      label="Headers"
                      description={headers.description}
                      schemaFormat={headers.schemaFormat}
                      originalSchema={headers.originalSchema}
                      conversionError={headers.conversionError}
                    />
                  )}
                  {(schemaTab === "payload" || !message.headers) && payload && (
                    <SchemaTabs
                      schema={payload.schema}
                      label="Payload"
                      description={payload.description}
                      schemaFormat={payload.schemaFormat}
                      originalSchema={payload.originalSchema}
                      conversionError={payload.conversionError}
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
        </div>
      </div>

      {/* Toggle button */}
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-border bg-neutral-50 hover:bg-neutral-100 transition-colors text-xs text-foreground-muted hover:text-foreground-secondary"
        >
          <span>{expanded ? "Show less" : "Show more"}</span>
          <IconArrowDown
            className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
