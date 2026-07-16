import { useCallback, useEffect, useMemo, useState } from "react";
import { AsyncAPIDocumentContext } from "../../contexts/index";
import ContentTab, { ContentTabItem } from "../../components/ContentTab";
import Navigation from "../../components/Navigation";
import { MessageObject } from "../../types/asyncapi/MessageObject";
import { ConfigInterface } from "../../config";
import { buildThemeVars } from "../../utils/theme";
import { DEFAULT_DEPTH_COLORS } from "../../components/schema/depthColors";
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
  const [rawSelectedOperationKey, setSelectedOperationKey] = useState<string | null>(null);
  const [rawSelectedMessageKey, setSelectedMessageKey] = useState<string | null>(null);
  const [rawSelectedSchemaKey, setSelectedSchemaKey] = useState<string | null>(null);

  // `activeTab` and the selection keys can go stale when a live config edit hides
  // their tab (e.g. `show.operations: false` while Operations is active), so clamp
  // them to the currently visible tabs instead of trusting the stored state.
  const effectiveTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : firstTab;
  const selectedOperationKey = show.operations !== false ? rawSelectedOperationKey : null;
  const selectedMessageKey = show.messages !== false ? rawSelectedMessageKey : null;
  const selectedSchemaKey = show.schemas !== false ? rawSelectedSchemaKey : null;
  const derefCache = useMemo(() => new Map<string, unknown>(), []);
  const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    derefCache.clear();
  }, [asyncapi, derefCache]);

  // Fallback resolver for the few $refs that survive upfront resolution —
  // resolveDocument deliberately leaves cycle-forming refs in place, and the
  // schema tree resolves those lazily (one level per expansion) via this.
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
  const depthColors = config.theme?.depthColors?.length
    ? config.theme.depthColors
    : DEFAULT_DEPTH_COLORS;

  const value = useMemo(
    () => ({ document: asyncapi, deref, portalHost, rootElement, defaultSchemaExpanded, depthColors }),
    [asyncapi, deref, portalHost, rootElement, defaultSchemaExpanded, depthColors],
  );

  const activeContent =
    effectiveTab === "operations" ? (
      <Operations
        operations={asyncapi.operations ?? {}}
        selectedKey={selectedOperationKey}
        onSelectKey={setSelectedOperationKey}
      />
    ) : effectiveTab === "messages" ? (
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
        ref={setRootElement}
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
            activeTab={effectiveTab}
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
          current={effectiveTab}
          onChange={(id) => {
            if (isAsyncAPITabKey(id)) setActiveTab(id);
          }}
        />
        <div
          id={`panel-${effectiveTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${effectiveTab}`}
        >
          {activeContent}
        </div>
      </div>
    </AsyncAPIDocumentContext.Provider>
  );
}
