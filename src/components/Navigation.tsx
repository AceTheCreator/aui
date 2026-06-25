import { useEffect, useRef, useState } from "react";
import SidebarIcon from "../icons/SideBar";
import { SidePanel } from "./SidePanel";
import IconOperation from "../icons/Operation";
import IconMessage from "../icons/Message";
import IconSchema from "../icons/Schema";
import { Operation } from "../types/asyncapi/Operation";
import { MessageObject } from "../types/asyncapi/MessageObject";
import { Info } from "../types/asyncapi/Info";
import { OperationAction } from "../types/asyncapi/OperationAction";
import { SideBarConfig } from "../config/config";
import { useAsyncAPIDocument } from "../contexts";
import { hasRef } from "../utils/hasRef";
import { ChannelAddress } from "./ChannelAddress";
import { Parameter } from "../types/asyncapi/Parameter";

type NavTab = "operations" | "messages" | "schemas";

interface NavSection {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
}

interface NavigationProps {
  info: Info;
  operations?: Record<string, Operation>;
  messages?: Record<string, MessageObject>;
  schemas?: Record<string, unknown>;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onItemSelect?: (tab: NavTab, key: string) => void;
  selectedItem?: { tab: NavTab; key: string } | null;
  sidebarConfig?: SideBarConfig;
}

export default function Navigation({
  info,
  operations = {},
  messages = {},
  schemas = {},
  activeTab,
  onTabChange,
  onItemSelect,
  selectedItem,
  sidebarConfig,
}: NavigationProps) {
  const [open, setOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const { deref } = useAsyncAPIDocument();

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setPanelWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const resolveChannel = (key: string): { address?: string | null; parameters?: Record<string, Parameter> } | null => {
    if (!sidebarConfig?.useChannelAddressAsIdentifier) return null;
    const op = operations[key];
    let channel: unknown = op?.channel;
    if (hasRef(channel)) channel = deref((channel as { $ref: string }).$ref);
    return (channel as { address?: string | null; parameters?: Record<string, Parameter> } | null) ?? null;
  };

  const sections: NavSection[] = [
    { id: "operations", label: "Operations", icon: IconOperation, items: Object.keys(operations) },
    { id: "messages",   label: "Messages",   icon: IconMessage,   items: Object.keys(messages) },
    { id: "schemas",    label: "Schemas",    icon: IconSchema,    items: Object.keys(schemas) },
  ];

  const navigate = (tab: NavTab, itemId?: string) => {
    onTabChange(tab);
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
        className="panel-toggle-btn"
        style={open && panelWidth ? { left: `${panelWidth + 10}px` } : undefined}
      >
        <SidebarIcon isCollapsed={open} />
      </button>

      <SidePanel ref={panelRef} isOpen={open} side="left" onClose={() => setOpen(false)} width="min-w-[450px] auto">
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

            return (
              <div key={id} className="pb-1">
                {/* Section header */}
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

                {/* Items */}
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
                              onItemSelect?.(id, item);
                            }}
                            className={`w-full text-left flex items-center gap-2 text-xs py-1.5 px-2 rounded-md transition-colors ${
                              isItemSelected
                                ? "bg-primary-50 text-primary-200 font-medium"
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
                              ? <ChannelAddress address={channel.address} parameters={channel.parameters} className="bg-transparent p-0" />
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
