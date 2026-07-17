import { useEffect, useState } from "react";
import SidebarIcon from "../icons/SideBar";
import { SidePanel } from "./SidePanel";
import IconOperation from "../icons/Operation";
import IconMessage from "../icons/Message";
import IconSchema from "../icons/Schema";
import IconServer from "../icons/Server";
import { Operation } from "../types/asyncapi/Operation";
import { MessageObject } from "../types/asyncapi/MessageObject";
import { Info } from "../types/asyncapi/Info";
import { OperationAction } from "../types/asyncapi/OperationAction";
import { SideBarConfig } from "../config/config";
import { useAsyncAPIDocument } from "../contexts";
import { useAutoHideOnScroll } from "../utils/useAutoHideOnScroll";
import { useElementRect } from "../utils/useElementRect";
import { ChannelAddress } from "./ChannelAddress";
import { Parameter } from "../types/asyncapi/Parameter";

export type NavTab = "operations" | "messages" | "schemas";
// Servers isn't a switchable tab (it's always on screen, above the tabs) —
// but it needs the same "find it in the sidebar, jump straight to it" path
// as everything else, so it's a section here without being a NavTab.
export type NavSectionId = NavTab | "servers";

interface NavSection {
  id: NavSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
}

interface NavigationProps {
  info: Info;
  operations?: Record<string, Operation>;
  messages?: Record<string, MessageObject>;
  schemas?: Record<string, unknown>;
  servers?: Record<string, unknown>;
  /** Which section is currently the user's focus, for header highlighting —
   * a single authoritative value covering all four sections (including
   * Servers) so at most one header is ever highlighted at once. Distinct
   * from `onTabChange`, which only fires for the three switchable tabs. */
  activeTab: NavSectionId | null;
  onTabChange: (tab: NavTab) => void;
  onItemSelect?: (tab: NavTab, key: string) => void;
  onSelectServer?: (key: string) => void;
  selectedItem?: { tab: NavSectionId; key: string } | null;
  sidebarConfig?: SideBarConfig;
}

export default function Navigation({
  info,
  operations = {},
  messages = {},
  schemas = {},
  servers = {},
  activeTab,
  onTabChange,
  onItemSelect,
  onSelectServer,
  selectedItem,
  sidebarConfig,
}: NavigationProps) {
  const [open, setOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(0);
  const [panelElement, setpanelElement] = useState<HTMLDivElement | null>(null);
  const { rootElement } = useAsyncAPIDocument();

  // Once the widget's top is scrolled past, the toggle detaches and pins to the
  // viewport top: hidden while scrolling down, revealed on any upward scroll,
  // and never hidden while the panel is open.
  const toggleMode = useAutoHideOnScroll(rootElement, open);
  const isPinnedToViewport = toggleMode !== "docked";
  const rootRect = useElementRect(rootElement, isPinnedToViewport);

  // Horizontal follow of the open panel uses transform (not `left`) so the
  // docked<->pinned position swap doesn't animate through a stale `left`.
  const panelShift = open && panelWidth ? panelWidth - 2 : 0;
  const toggleStyle: React.CSSProperties = {
    transform: `translate(${panelShift}px, ${toggleMode === "hidden" ? "-150%" : "0px"})`,
    ...(isPinnedToViewport
      ? {
          position: "fixed",
          top: 10,
          left: (rootRect?.left ?? 0) + 12,
          pointerEvents: toggleMode === "hidden" ? "none" : undefined,
        }
      : {}),
  };

  useEffect(() => {
    if (!panelElement) return;
    const observer = new ResizeObserver(([entry]) => setPanelWidth(entry.contentRect.width));
    observer.observe(panelElement);
    return () => observer.disconnect();
  }, [panelElement]);

  const resolveChannel = (key: string): { address?: string | null; parameters?: Record<string, Parameter> } | null => {
    if (!sidebarConfig?.useChannelAddressAsIdentifier) return null;
    // op.channel $refs are already inlined by resolveDocument / @asyncapi/parser.
    const channel: unknown = operations[key]?.channel;
    return (channel as { address?: string | null; parameters?: Record<string, Parameter> } | null) ?? null;
  };

  const sections: NavSection[] = [
    // Listed first to match the page's own order (Info → Servers → tabs) —
    // and because "how do I connect/authenticate" is usually the first thing
    // someone looks for, not something to bury below the tab catalogs.
    { id: "servers",    label: "Servers",    icon: IconServer,    items: Object.keys(servers) },
    { id: "operations", label: "Operations", icon: IconOperation, items: Object.keys(operations) },
    { id: "messages",   label: "Messages",   icon: IconMessage,   items: Object.keys(messages) },
    { id: "schemas",    label: "Schemas",    icon: IconSchema,    items: Object.keys(schemas) },
  ];

  const isNavTab = (id: NavSectionId): id is NavTab => id !== "servers";

  // Servers has no tab to switch into (it's always on screen) — only the
  // scroll-to-item part applies there.
  const navigate = (id: NavSectionId, itemId?: string) => {
    if (isNavTab(id)) onTabChange(id);
    if (itemId) {
      setTimeout(() => {
        document.getElementById(itemId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        title={open ? "Close navigation" : "Open navigation"}
        className="panel-toggle-btn bg-neutral-100"
        style={toggleStyle}
      >
        <SidebarIcon isCollapsed={open} />
      </button>

      <SidePanel ref={setpanelElement} isOpen={open} side="left" onClose={() => setOpen(false)} width="min-w-[450px] w-auto">
        <nav className="space-y-1">
          {/* API info header */}
          <div className="flex items-center gap-2 pb-4 mb-2 border-b border-border">
            <span className="text-sm font-semibold text-foreground truncate">{info.title}</span>
            {info.version && (
              <span className="shrink-0 text-xs font-mono bg-primary-50 text-primary-600 border border-primary-200 px-1.5 py-0.5 rounded">
                v{info.version}
              </span>
            )}
          </div>

          {sections.map(({ id, label, icon: Icon, items }) => {
            const isActive = activeTab === id;

            if(items.length < 1){
                return
            }

            return (
              <div key={id} className="pb-1">
                {/* Nav Section header */}
                <button
                  onClick={() => navigate(id)}
                  className={`flex items-center gap-2 w-full text-left px-2 py-2 rounded-md group transition-colors ${
                    isActive ? "bg-primary-50" : "hover:bg-neutral-50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    isActive ? "text-primary-500" : "text-foreground-muted group-hover:text-foreground-secondary"
                  }`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive ? "text-primary-600" : "text-foreground-muted group-hover:text-foreground-secondary"
                  }`}>
                    {label}
                  </span>
                  <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                    isActive
                      ? "bg-primary-100 text-primary-500 border border-primary-200"
                      : "bg-neutral-100 text-foreground-muted"
                  }`}>
                    {items.length}
                  </span>
                </button>

                {/* Nav Section Children Items */}
                {items.length > 0 && (
                  <ul className="mt-0.5 space-y-0.5 pl-3 border-l border-border ml-4">
                    {items.map((item) => {
                      const op = id === "operations" ? operations[item] : null;
                      const channel = id === "operations" ? resolveChannel(item) : null;
                      const action = op?.action;
                      const actionColor =
                        action === OperationAction.SEND
                          ? "bg-green-100 text-green-700"
                          : action === OperationAction.RECEIVE
                          ? "bg-blue-100 text-blue-700"
                          : null;

                      const isItemSelected = selectedItem?.tab === id && selectedItem?.key === item;

                      return (
                        <li key={item}>
                          <button
                            onClick={() => {
                              navigate(id, `${id.slice(0, -1)}-${item}`);
                              if (isNavTab(id)) onItemSelect?.(id, item);
                              else onSelectServer?.(item);
                            }}
                            className={`w-full text-left flex items-center gap-2 text-xs py-1.5 px-2 rounded-md transition-colors ${
                              isItemSelected
                                ? "bg-primary-50 text-primary-500 font-medium"
                                : isActive
                                ? "text-foreground-secondary hover:text-foreground hover:bg-primary-50"
                                : "text-foreground-muted hover:text-foreground-secondary hover:bg-neutral-50"
                            }`}
                          >
                            {actionColor && (
                              <span className={`shrink-0 text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${actionColor}`}>
                                {action}
                              </span>
                            )}
                            {channel?.address
                              ? <ChannelAddress address={channel.address} parameters={channel.parameters} className="text-xs bg-transparent p-0" />
                              : <span className="truncate">{item}</span>
                            }
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </SidePanel>
    </>
  );
}
