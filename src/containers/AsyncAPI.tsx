import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { AsyncAPIDocumentContext } from "../contexts/index";
import { AsyncAPIMetadata } from "../types/metadata";
import { ServerInterface } from "../types/server";
import IconMessage from "../icons/Message";
import IconOperation from "../icons/Operation";
import IconSchema from "../icons/Schema";
import Information from "./Information/Information";
import Messages from "./Messages/Messages";
import Servers from "./Server/Servers";
import Operations from "./Operation/Operations";
import Schemas from "./Schema/Schemas";
import Section from "../components/Section";

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

interface AsyncAPISchemaDefinition extends Record<string, unknown> {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, unknown>;
}

interface AsyncAPIOperationDefinition extends Record<string, unknown> {
  action?: string;
  channel?: {
    address?: string | null;
    [key: string]: unknown;
  };
}

interface AsyncAPIDocumentData extends Record<string, unknown> {
  info: AsyncAPIMetadata;
  servers?: Record<string, ServerInterface>;
  operations?: Record<string, AsyncAPIOperationDefinition>;
  components?: {
    messages?: Record<string, AsyncAPIMessageDefinition>;
    schemas?: Record<string, AsyncAPISchemaDefinition>;
  };
}

export interface IAsyncAPIProps {
  asyncapi: AsyncAPIDocumentData;
}

type AsyncAPITabKey = "operations" | "messages" | "schemas";

const contentTabs: Array<{
  key: AsyncAPITabKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { key: "operations", label: "Operations", icon: IconOperation },
  { key: "messages", label: "Messages", icon: IconMessage },
  { key: "schemas", label: "Schemas", icon: IconSchema },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const AsyncAPI = ({ asyncapi }: IAsyncAPIProps) => {
  const [activeTab, setActiveTab] = useState<AsyncAPITabKey>("operations");
  const derefCache = useMemo(() => new Map<string, unknown>(), []);

  useEffect(() => {
    derefCache.clear();
  }, [asyncapi, derefCache]);

  const deref = useCallback((refPath: string) => {
    if (derefCache.has(refPath)) return derefCache.get(refPath);

    const parts = refPath.replace(/^#\//, "").split("/");
    let current: unknown = asyncapi;

    for (const part of parts) {
      if (!isRecord(current)) {
        current = undefined;
        break;
      }

      current = current[part];

      if (current == null) break;
    }

    if (current !== undefined) {
      derefCache.set(refPath, current);
    }

    return current;
  }, [asyncapi, derefCache]);

  const value = useMemo(
    () => ({ document: asyncapi, deref }),
    [asyncapi, deref]
  );

  const tabPanels = {
    operations: <Operations operations={asyncapi.operations ?? {}} />,
    messages: <Messages messages={asyncapi.components?.messages ?? {}} />,
    schemas: <Schemas schemas={asyncapi.components?.schemas ?? {}} />,
  };

  const tabs = (
    <div
      className="border-b border-gray-200"
      role="tablist"
      aria-label="AsyncAPI sections"
    >
      <div className="flex flex-wrap gap-6">
        {contentTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <AsyncAPIDocumentContext.Provider value={value}>
      <Information {...asyncapi.info} />
      {asyncapi.servers && Object.keys(asyncapi.servers).length > 0 && (
        <Servers servers={asyncapi.servers} />
      )}
      <div className="container">
        <Section
          title=""
          content={tabs}
          stickySideContent={true}
        />
      </div>
      {contentTabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <div
            key={tab.key}
            id={`panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.key}`}
            hidden={!isActive}
          >
            {isActive ? tabPanels[tab.key] : null}
          </div>
        );
      })}
    </AsyncAPIDocumentContext.Provider>
  );
};

export default AsyncAPI;
