import { useState } from "react";
import Section from "../../components/Section";
import { MessageObject } from "../../types/asyncapi/MessageObject";
import { Tag } from "../../types/asyncapi/Tag";
import IconArrowDown from "../../icons/ArrowDown";
import Tabs from "../../components/Tabs";
import SchemaTabs from "../../components/SchemaTab";
import TagComponent from "../../components/Tag";

interface MessagesProps {
  messages: Record<string, MessageObject>;
}

function MessageRow({ messageKey, message, first }: { messageKey: string; message: MessageObject; first: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [schemaTab, setSchemaTab] = useState<"payload" | "headers">("headers");

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
    <>
      <tr className={first ? "" : "border-t border-gray-200"} {...rowEvents}>
        <td className="px-6 py-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-800">
              {message.title ?? message.name ?? messageKey}
            </span>
            <span className="w-fit text-xs font-mono bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded">
              {messageKey}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {message.summary ?? "—"}
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col items-start gap-1.5">
            {message.contentType && (
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {message.contentType ?? "—"}
              </span>
            )}
            {message.deprecated && (
              <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-200">
                deprecated
              </span>
            )}
          </div>
        </td>
      </tr>

      <tr {...rowEvents}>
        <td colSpan={3} className="p-0">
          <div
            className={`grid transition-all duration-200 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="overflow-hidden">
              <div className="px-6 pb-4 space-y-4 border-t border-gray-100 pt-3">
                {message.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
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
                        message.headers && (
                          <SchemaTabs
                            schema={message.headers}
                            label="Headers"
                          />
                        )}
                      {(schemaTab === "payload" || !message.headers) &&
                        message.payload && (
                          <SchemaTabs
                            schema={message.payload}
                            label="Payload"
                            description={
                              (message.payload as Record<string, unknown>)
                                ?.description as string | undefined
                            }
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
                className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-400 hover:text-gray-600"
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
    </>
  );
}

export default function Messages({ messages }: MessagesProps) {
  const messageEntries = Object.entries(messages);

  const content = messageEntries.length ? (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Summary
            </th>
            <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {messageEntries.map(([messageKey, message], i) => (
            <MessageRow key={messageKey} messageKey={messageKey} message={message} first={i === 0} />
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
      No messages defined in this AsyncAPI document.
    </div>
  );

  return (
    <div className="flex justify-center w-full">
      <Section content={content} stickySideContent={false} />
    </div>
  );
}
