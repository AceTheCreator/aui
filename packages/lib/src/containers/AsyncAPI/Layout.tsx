import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AsyncAPIDocumentContext } from "../../contexts/index";
import ContentTab, { ContentTabItem } from "../../components/ContentTab";
import Navigation, { NavSectionId } from "../../components/Navigation";
import SearchPanel from "../../components/SearchPanel";
import { useSpecSearch } from "../../hooks/useSpecSearch";
import { SearchEntry } from "../../helpers/searchIndex";
import { clearSearchHighlight, highlightSearchMatch } from "../../helpers/textHighlight";
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
  // Single authoritative "where is the user's attention" value for the
  // sidebar's own header highlighting — covers Servers too, even though it
  // isn't a switchable content tab, so at most one section header is ever
  // highlighted at a time. `activeTab` alone can't do this: selecting a
  // server doesn't (and can't) change which content tab is showing, so a
  // header driven by `activeTab === id` and one driven by "a server is
  // selected" could both read true simultaneously.
  // Keep the content tab active on initial render, but don't highlight any
  // sidebar section until the user interacts with it.
  const [focusedNavSection, setFocusedNavSection] = useState<NavSectionId | null>(null);
  const focusTab = (tab: AsyncAPITabKey) => {
    setActiveTab(tab);
    setFocusedNavSection(tab);
  };
  const [rawSelectedOperationKey, setSelectedOperationKey] = useState<string | null>(null);
  const [rawSelectedMessageKey, setSelectedMessageKey] = useState<string | null>(null);
  const [rawSelectedSchemaKey, setSelectedSchemaKey] = useState<string | null>(null);
  const [rawSelectedServerKey, setSelectedServerKey] = useState<string | null>(null);

  // `activeTab` and the selection keys can go stale when a live config edit hides
  // their tab (e.g. `show.operations: false` while Operations is active), so clamp
  // them to the currently visible tabs instead of trusting the stored state.
  const effectiveTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : firstTab;
  const selectedOperationKey = show.operations !== false ? rawSelectedOperationKey : null;
  const selectedMessageKey = show.messages !== false ? rawSelectedMessageKey : null;
  const selectedSchemaKey = show.schemas !== false ? rawSelectedSchemaKey : null;
  const selectedServerKey = show.servers !== false ? rawSelectedServerKey : null;
  const serverNames = asyncapi.servers ? Object.keys(asyncapi.servers) : [];
  const derefCache = useMemo(() => new Map<string, unknown>(), []);
  const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);

  const { query: searchQuery, setQuery: setSearchQuery, results: searchResults } =
    useSpecSearch(asyncapi, { threshold: 0.3, limit: 20 });

  const [focusSection, setFocusSection] = useState<string | null>(null);
  const [schemaFocusTarget, setSchemaFocusTarget] = useState<{ tokens: string[]; id: string } | null>(null);

  const [activeHighlight, setActiveHighlight] = useState<{ targetId: string; query: string; highlight: boolean } | null>(null);
  const lastScrolledIdRef = useRef<string | null>(null);

  const handleSearchSelect = (entry: SearchEntry) => {
    if (entry.tab === "operations" || entry.tab === "messages" || entry.tab === "schemas") {
      focusTab(entry.tab);
    } else if (entry.tab === "servers") {
      setFocusedNavSection("servers");
    }
    setSelectedOperationKey(entry.tab === "operations" ? entry.key : null);
    setSelectedMessageKey(entry.tab === "messages" ? entry.key : null);
    setSelectedSchemaKey(entry.tab === "schemas" ? entry.key : null);
    setSelectedServerKey(entry.tab === "servers" ? entry.key : null);
    setFocusSection(entry.focusSection ?? null);
    setSchemaFocusTarget(
      entry.tab === "schemas" && entry.schemaFocusTokens
        ? { tokens: entry.schemaFocusTokens, id: entry.targetId }
        : null,
    );
    if (entry.tab === "schemas") clearSearchHighlight();
    setActiveHighlight({ targetId: entry.targetId, query: searchQuery, highlight: entry.tab !== "schemas" });
  };

  useEffect(() => {
    if (!activeHighlight) return;
    const { targetId, query, highlight } = activeHighlight;
    let cancelled = false;

    const findWrapper = (attempt: number) => {
      if (cancelled) return;
      const target = document.getElementById(targetId);
      if (!target) {
        if (attempt < 40) setTimeout(() => findWrapper(attempt + 1), 50);
        return;
      }
      if (lastScrolledIdRef.current !== targetId) {
        // Guarded: a scrollIntoView failure shouldn't take the highlight
        // down with it — they're independent concerns.
        try {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {
          // ignore — highlighting still proceeds below
        }
        lastScrolledIdRef.current = targetId;
      }
      if (highlight) refreshHighlight(0);
    };

    const refreshHighlight = (attempt: number) => {
      if (cancelled) return;
      const target = document.getElementById(targetId);
      if (target) highlightSearchMatch(target, query);
      if (attempt < 6) setTimeout(() => refreshHighlight(attempt + 1), 100);
    };

    setTimeout(() => findWrapper(0), 50);
    return () => {
      cancelled = true;
    };
  }, [activeHighlight, effectiveTab, selectedOperationKey, selectedMessageKey, selectedSchemaKey, selectedServerKey, focusSection, schemaFocusTarget]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setActiveHighlight(null);
      clearSearchHighlight();
    }
  }, [searchQuery]);

  useEffect(() => clearSearchHighlight, []);

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
        focusSection={focusSection}
      />
    ) : effectiveTab === "messages" ? (
      <Messages
        messages={(asyncapi.components?.messages ?? {}) as Record<string, MessageObject>}
        selectedKey={selectedMessageKey}
        focusSection={focusSection}
      />
    ) : effectiveTab === "schemas" ? (
      <Schemas
        schemas={asyncapi.components?.schemas ?? {}}
        selectedKey={selectedSchemaKey}
        focusTarget={schemaFocusTarget}
      />
    ) : null;

  const themeVars = config.theme ? buildThemeVars(config.theme) : {};

  return (
    <AsyncAPIDocumentContext.Provider value={value}>
      <div
        ref={setRootElement}
        style={themeVars as React.CSSProperties}
        className={`relative @container bg-background text-foreground p-2 ${
          show.sidebar !== false ? "pt-14" : ""
        }`}
      >
        <div ref={setPortalHost} className="asyncapi-portal-root" />
        {show.search !== false && (
          <SearchPanel
            query={searchQuery}
            onQueryChange={setSearchQuery}
            results={searchResults}
            onSelectResult={handleSearchSelect}
          />
        )}
        {show.info !== false && (
          <div id="info-panel">
            <Information {...asyncapi.info} />
          </div>
        )}
        {show.servers !== false && serverNames.length > 0 && (
          <div id={`server-${selectedServerKey ?? serverNames[0]}`}>
            <Servers
              servers={asyncapi.servers!}
              selectedServer={selectedServerKey}
              onSelectServer={setSelectedServerKey}
              focusSection={focusSection}
            />
          </div>
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
            servers={show.servers !== false ? asyncapi.servers : undefined}
            sidebarConfig={config.sidebar}
            activeTab={focusedNavSection}
            onTabChange={focusTab}
            onItemSelect={(tab, key) => {
              focusTab(tab);
              setSelectedOperationKey(tab === "operations" ? key : null);
              setSelectedMessageKey(tab === "messages" ? key : null);
              setSelectedSchemaKey(tab === "schemas" ? key : null);
            }}
            onSelectServer={(key) => {
              setFocusedNavSection("servers");
              setSelectedOperationKey(null);
              setSelectedMessageKey(null);
              setSelectedSchemaKey(null);
              setSelectedServerKey(key);
            }}
            selectedItem={
              selectedOperationKey
                ? { tab: "operations" as const, key: selectedOperationKey }
                : selectedMessageKey
                ? { tab: "messages" as const, key: selectedMessageKey }
                : selectedSchemaKey
                ? { tab: "schemas" as const, key: selectedSchemaKey }
                : selectedServerKey
                ? { tab: "servers" as const, key: selectedServerKey }
                : null
            }
          />
        )}
        <ContentTab
          tabs={tabs}
          current={effectiveTab}
          onChange={(id) => {
            if (isAsyncAPITabKey(id)) focusTab(id);
          }}
        />
        {effectiveTab && (
          <div
            id={`panel-${effectiveTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${effectiveTab}`}
          >
            {activeContent}
          </div>
        )}
      </div>
    </AsyncAPIDocumentContext.Provider>
  );
}
