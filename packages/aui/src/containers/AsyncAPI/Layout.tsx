import { useCallback, useEffect, useMemo, useState } from "react";
import { AsyncAPIDocumentContext } from "../../contexts/index";
import ContentTab, { ContentTabItem } from "../../components/ContentTab";
import Navigation from "../../components/Navigation";
import { MessageObject } from "../../types/asyncapi/MessageObject";
import { ConfigInterface } from "../../config";
import { buildThemeVars } from "../../utils/theme";
import IconMessage from "../../icons/Message";
import IconOperation from "../../icons/Operation";
import IconSchema from "../../icons/Schema";
import Information from "../Information/Information";
import Messages from "../Messages/Messages";
import Servers from "../Server/Servers";
import Operations from "../Operation/Operations";
import Schemas from "../Schema/Schemas";
import { AsyncAPIDocumentData } from "../../types/schema";

export interface LayoutProps {
  asyncapi: AsyncAPIDocumentData;
  config: ConfigInterface;
}

type AsyncAPITabKey = "operations" | "messages" | "schemas";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAsyncAPITabKey = (value: string): value is AsyncAPITabKey =>
  value === "operations" || value === "messages" || value === "schemas";

export default function Layout({ asyncapi, config }: LayoutProps) {
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

  //TODO: Refactor the dereferencing logic
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

  const defaultSchemaExpanded = config.expand?.schemas === true;

  const value = useMemo(
    () => ({ document: asyncapi, deref, portalHost, defaultSchemaExpanded }),
    [asyncapi, deref, portalHost, defaultSchemaExpanded],
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
      <div
        style={themeVars as React.CSSProperties}
        className={`relative @container bg-background text-foreground p-2 ${show.sidebar !== false ? "pt-14" : ""}`}
      >
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
            operations={show.operations !== false ? asyncapi.operations : undefined}
            messages={
              show.messages !== false
                ? (asyncapi.components?.messages as Record<string, MessageObject>)
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
            if (isAsyncAPITabKey(id)) setActiveTab(id);
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
}
