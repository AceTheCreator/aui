import { useCallback, useEffect, useMemo, useState } from "react";
import { AsyncAPIDocumentContext } from "../contexts/index";
import ContentTab, { ContentTabItem } from "../components/ContentTab";
import Navigation from "../components/Navigation";
import { Info } from "../types/asyncapi/Info";
import { MessageObject } from "../types/asyncapi/MessageObject";
import { Server } from "../types/asyncapi/Server";
import { Operation } from "../types/asyncapi/Operation";
import { ConfigInterface, defaultConfig } from "../config";
import { buildThemeVars } from "../utils/theme";
import IconMessage from "../icons/Message";
import IconOperation from "../icons/Operation";
import IconSchema from "../icons/Schema";
import Information from "./Information/Information";
import Messages from "./Messages/Messages";
import Servers from "./Server/Servers";
import Operations from "./Operation/Operations";
import Schemas from "./Schema/Schemas";


interface AsyncAPISchemaDefinition extends Record<string, unknown> {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, unknown>;
}

interface AsyncAPIDocumentData extends Record<string, unknown> {
  info: Info;
  servers?: Record<string, Server>;
  operations?: Record<string, Operation>;
  components?: {
    messages?: Record<string, MessageObject>;
    schemas?: Record<string, AsyncAPISchemaDefinition>;
  };
}

export interface IAsyncAPIProps {
  asyncapi: AsyncAPIDocumentData;
  config?: ConfigInterface;
}



type AsyncAPITabKey = "operations" | "messages" | "schemas";
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAsyncAPITabKey = (value: string): value is AsyncAPITabKey =>
  value === "operations" || value === "messages" || value === "schemas";

const AsyncAPI = ({ asyncapi, config = defaultConfig }: IAsyncAPIProps) => {
  const show = config.show ?? {};

  const tabs: ContentTabItem[] = [
    ...(show.operations !== false ? [{ id: "operations", name: "Operations", icon: IconOperation }] : []),
    ...(show.messages   !== false ? [{ id: "messages",   name: "Messages",   icon: IconMessage   }] : []),
    ...(show.schemas    !== false ? [{ id: "schemas",    name: "Schemas",    icon: IconSchema    }] : []),
  ];

  const firstTab = (tabs[0]?.id ?? "operations") as AsyncAPITabKey;
  const [activeTab, setActiveTab] = useState<AsyncAPITabKey>(firstTab);
  const [selectedOperationKey, setSelectedOperationKey] = useState<string | null>(null);
  const [selectedMessageKey, setSelectedMessageKey] = useState<string | null>(null);
  const [selectedSchemaKey, setSelectedSchemaKey] = useState<string | null>(null);
  const derefCache = useMemo(() => new Map<string, unknown>(), []);
  const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);

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

      const decoded = part.replace(/~1/g, "/").replace(/~0/g, "~");
      current = current[decoded];

      if (current == null) break;
    }

    if (current !== undefined) {
      derefCache.set(refPath, current);
    }

    return current;
  }, [asyncapi, derefCache]);

const value = useMemo(() => ({
    document: asyncapi,
    deref,
    portalHost,
  }),
  [asyncapi, deref, portalHost],
);

  const activeContent =
    activeTab === "operations" ? (
      <Operations
        operations={asyncapi.operations ?? {}}
        selectedKey={selectedOperationKey}
        onSelectKey={setSelectedOperationKey}
      />
    ) : activeTab === "messages" ? (
      <Messages
        messages={(asyncapi.components?.messages ?? {}) as Record<string, MessageObject>}
        selectedKey={selectedMessageKey}
      />
    ) : (
      <Schemas schemas={asyncapi.components?.schemas ?? {}} selectedKey={selectedSchemaKey} />
    );

  const themeVars = config.theme ? buildThemeVars(config.theme) : {};

  return (
    <AsyncAPIDocumentContext.Provider value={value}>
      <div style={themeVars as React.CSSProperties}>
        <div ref={setPortalHost} className="asyncapi-portal-root" />
        {show.info !== false && <Information {...asyncapi.info} />}
        {show.servers !== false &&
          asyncapi.servers &&
          Object.keys(asyncapi.servers).length > 0 && (
            <Servers servers={asyncapi.servers} />
          )}
        {show.sidebar !== false && (
          <Navigation
            info={asyncapi.info}
            operations={
              show.operations !== false ? asyncapi.operations : undefined
            }
            messages={
              show.messages !== false
                ? (asyncapi.components?.messages as Record<
                    string,
                    MessageObject
                  >)
                : undefined
            }
            schemas={
              show.schemas !== false
                ? (asyncapi.components?.schemas as Record<string, unknown>)
                : undefined
            }
            sidebarConfig={config.sidebar}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onItemSelect={(tab, key) => {
              setActiveTab(tab);
              setSelectedOperationKey(tab === "operations" ? key : null);
              setSelectedMessageKey(tab === "messages" ? key : null);
              setSelectedSchemaKey(tab === "schemas" ? key : null);
            }}
            selectedItem={
              selectedOperationKey
                ? { tab: "operations" as const, key: selectedOperationKey }
                : selectedMessageKey
                  ? { tab: "messages" as const, key: selectedMessageKey }
                  : selectedSchemaKey
                    ? { tab: "schemas" as const, key: selectedSchemaKey }
                    : null
            }
          />
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
      </div>
    </AsyncAPIDocumentContext.Provider>
  );
};

export default AsyncAPI;
