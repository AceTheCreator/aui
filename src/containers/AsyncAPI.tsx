import { useCallback, useEffect, useMemo, useState } from "react";
import { AsyncAPIDocumentContext } from "../contexts/index";
import ContentTab, { ContentTabItem } from "../components/ContentTab";
import { Info } from "../types/asyncapi/Info";
import { Server } from "../asyncapi-models/Server";
import { Operation } from "../types/asyncapi/Operation";
import IconMessage from "../icons/Message";
import IconOperation from "../icons/Operation";
import IconSchema from "../icons/Schema";
import Information from "./Information/Information";
import Messages from "./Messages/Messages";
import Servers from "./Server/Servers";
import Operations from "./Operation/Operations";
import Schemas from "./Schema/Schemas";
import { SchemaNodeData } from "../types/schema";

interface AsyncAPIMessageDefinition {
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  contentType?: string;
  payload?: Record<string, unknown> & {
    type?: string;
  };
}

interface AsyncAPISchemaDefinition extends SchemaNodeData {}

interface AsyncAPIDocumentData extends Record<string, unknown> {
  info: Info;
  servers?: Record<string, Server>;
  operations?: Record<string, Operation>;
  components?: {
    messages?: Record<string, AsyncAPIMessageDefinition>;
    schemas?: Record<string, AsyncAPISchemaDefinition>;
  };
}

export interface IAsyncAPIProps {
  asyncapi: AsyncAPIDocumentData;
}

type AsyncAPITabKey = "operations" | "messages" | "schemas";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Type guard: ensures a tab id from ContentTab is one of the supported AsyncAPI sections. */
const isAsyncAPITabKey = (value: string): value is AsyncAPITabKey =>
  value === "operations" || value === "messages" || value === "schemas";

/**
 * Root UI for rendering an AsyncAPI document.
 * Expects a pre-parsed object; provides `deref` to child components via context.
 */
const AsyncAPI = ({ asyncapi }: IAsyncAPIProps) => {
  const [activeTab, setActiveTab] = useState<AsyncAPITabKey>("operations");

  // Memoized cache so repeated $ref lookups don't re-walk the document tree.
  const derefCache = useMemo(() => new Map<string, unknown>(), []);

  // Invalidate cached $ref results when a different document is loaded.
  useEffect(() => {
    derefCache.clear();
  }, [asyncapi, derefCache]);

  /**
   * Dereference a JSON Pointer ($ref) against the current document.
   */
  const deref = useCallback((refPath: string) => {
    if (derefCache.has(refPath)) return derefCache.get(refPath);

    // Strip leading "#/" and split into path segments.
    const parts = refPath.replace(/^#\//, "").split("/");
    let current: unknown = asyncapi;

    for (const part of parts) {
      if (!isRecord(current)) {
        current = undefined;
        break;
      }

      // JSON Pointer escape sequences: ~1 → /, ~0 → ~
      const decoded = part.replace(/~1/g, "/").replace(/~0/g, "~");
      current = current[decoded];

      if (current == null) break;
    }

    if (current !== undefined) {
      derefCache.set(refPath, current);
    }

    return current;
  }, [asyncapi, derefCache]);

  // Shared context value consumed by child components via useAsyncAPIDocument().
  const value = useMemo(
    () => ({ document: asyncapi, deref }),
    [asyncapi, deref]
  );

  const tabs: ContentTabItem[] = [
    {
      id: "operations",
      name: "Operations",
      icon: IconOperation,
    },
    {
      id: "messages",
      name: "Messages",
      icon: IconMessage,
    },
    {
      id: "schemas",
      name: "Schemas",
      icon: IconSchema,
    },
  ];

  // Render the section that matches the currently selected tab.
  const activeContent =
    activeTab === "operations" ? (
      <Operations operations={asyncapi.operations ?? {}} />
    ) : activeTab === "messages" ? (
      <Messages messages={asyncapi.components?.messages ?? {}} />
    ) : (
      <Schemas schemas={asyncapi.components?.schemas ?? {}} />
    );

  return (
    <AsyncAPIDocumentContext.Provider value={value}>
      <Information {...asyncapi.info} />
      {asyncapi.servers && Object.keys(asyncapi.servers).length > 0 && (
        <Servers servers={asyncapi.servers} />
      )}
      <ContentTab
        tabs={tabs}
        current={activeTab}
        onChange={(id) => {
          if (isAsyncAPITabKey(id)) {
            setActiveTab(id);
          }
        }}
      />
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeContent}
      </div>
    </AsyncAPIDocumentContext.Provider>
  );
};

export default AsyncAPI;
