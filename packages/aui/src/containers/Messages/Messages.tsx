import { useEffect, useMemo, useState } from "react";
import Section from "../../components/Section";
import { MessageObject } from "../../types/asyncapi/MessageObject";
import { Tag } from "../../types/asyncapi/Tag";
import IconArrowDown from "../../icons/ArrowDown";
import Tabs from "../../components/Tabs";
import SchemaTabs from "../../components/schema/SchemaTab";
import TagComponent from "../../components/Tag";
import { CorrelationId } from "../../types/asyncapi/CorrelationId";
import { resolveSchemaInput } from "../../helpers/schemaFormat";
import { useAsyncAPIDocument } from "../../contexts";

interface MessagesProps {
  messages: Record<string, MessageObject>;
  selectedKey?: string | null;
}

function MessageRow({ messageKey, message, first, isSelected }: { messageKey: string; message: MessageObject; first: boolean; isSelected?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { deref } = useAsyncAPIDocument();

  useEffect(() => {
    if (isSelected) setExpanded(true);
  }, [isSelected]);
  const [schemaTab, setSchemaTab] = useState<"payload" | "headers">("headers");

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

  const rowEvents = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  return (
    <tbody
      className={`${first ? "" : "border-t border-border"} ${isSelected ? "bg-primary-50/60 outline outline-1 outline-primary-300" : ""}`}
    >
      <tr id={`message-${messageKey}`} className="" {...rowEvents}>
        <td className="px-6 py-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              {message.title ?? message.name ?? messageKey}
            </span>
            <span className="w-fit text-xs font-mono bg-primary-50 text-primary-600 border border-primary-200 px-1.5 py-0.5 rounded">
              {messageKey}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-foreground-muted">
          {message.summary ?? "—"}
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col items-start gap-1.5">
            <div className="flex justify-between w-full">
              <div></div>
              <div>
                {message.contentType && (
                  <span className="text-xs font-mono bg-neutral-100 text-foreground-muted px-1.5 py-0.5 rounded">
                    {message.contentType ?? "—"}
                  </span>
                )}
              </div>
            </div>
            {message.deprecated && (
              <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-200">
                deprecated
              </span>
            )}
            <div className="flex justify-between w-full">
              <div></div>
              <div>
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
              </div>
            </div>
          </div>
        </td>
      </tr>

      <tr {...rowEvents}>
        <td colSpan={3} className="p-0">
          <div
            className={`grid transition-all duration-200 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="overflow-hidden">
              <div className="px-6 pb-4 space-y-4 border-t border-border pt-3">
                {message.description && (
                  <p className="text-sm text-foreground-secondary leading-relaxed">
                    {message.description}
                  </p>
                )}
                {(message.payload || message.headers) && (
                  <div>
                    {message.payload && message.headers && (
                      <Tabs
                        tabs={[
                          { id: "headers", name: "Headers" },
                          { id: "payload", name: "Payload" },
                        ]}
                        current={schemaTab}
                        onChange={(id) =>
                          setSchemaTab(id as "payload" | "headers")
                        }
                      />
                    )}
                    <div className="mt-4">
                      {(schemaTab === "headers" || !message.payload) &&
                        headers && (
                          <SchemaTabs
                            schema={headers.schema}
                            label="Headers"
                            description={headers.description}
                            schemaFormat={headers.schemaFormat}
                            originalSchema={headers.originalSchema}
                            conversionError={headers.conversionError}
                          />
                        )}
                      {(schemaTab === "payload" || !message.headers) &&
                        payload && (
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
                    {(message.tags as Tag[]).map((tag, i) => (
                      <TagComponent key={i} name={`#${tag.name}`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </td>
      </tr>

      {hasMore && (
        <tr {...rowEvents}>
          <td colSpan={3} className="p-0">
            <div
              className={`overflow-hidden transition-all duration-200 ${hovered || expanded ? "max-h-9" : "max-h-0"}`}
            >
              <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-border bg-neutral-50 hover:bg-neutral-100 transition-colors text-xs text-foreground-muted hover:text-foreground-secondary"
              >
                <span>{expanded ? "Show less" : "Show more"}</span>
                <IconArrowDown
                  className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  );
}

export default function Messages({ messages, selectedKey }: MessagesProps) {
  const messageEntries = Object.entries(messages);

  const content = messageEntries.length ? (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-neutral-100">
          <tr>
            <th className="px-6 py-5 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-5 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Summary
            </th>
            <th className="px-6 py-5 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
          {messageEntries.map(([messageKey, message], i) => (
            <MessageRow key={messageKey} messageKey={messageKey} message={message} first={i === 0} isSelected={selectedKey === messageKey} />
          ))}
      </table>
    </div>
  ) : (
    <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-surface p-8 text-center text-sm text-foreground-muted">
      No messages defined in this AsyncAPI document.
    </div>
  );

  return (
    <div className="flex justify-center w-full">
      <Section content={content} stickySideContent={false} />
    </div>
  );
}
