import { useState } from "react";
import SidebarIcon from "../icons/SideBar";
import { SidePanel } from "./SidePanel";
import IconOperation from "../icons/Operation";
import IconMessage from "../icons/Message";
import IconSchema from "../icons/Schema";
import { Operation } from "../types/asyncapi/Operation";
import { MessageObject } from "../types/asyncapi/MessageObject";
import { Info } from "../types/asyncapi/Info";
import { OperationAction } from "../types/asyncapi/OperationAction";

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
}: NavigationProps) {
  const [open, setOpen] = useState(false);

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
        className={`panel-toggle-btn ${open ? "panel-toggle-btn-open" : ""}`}
      >
        <SidebarIcon isCollapsed={open} />
      </button>

      <SidePanel isOpen={open} side="left" onClose={() => setOpen(false)} width="w-[450px]">
        <nav className="space-y-1">
          {/* API info header */}
          <div className="flex items-center gap-2 pb-4 mb-2 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900 truncate">{info.title}</span>
            {info.version && (
              <span className="shrink-0 text-xs font-mono bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded">
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
                    isActive ? "bg-orange-50" : "hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"
                  }`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}>
                    {label}
                  </span>
                  <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                    isActive
                      ? "bg-orange-100 text-orange-500 border border-orange-200"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {items.length}
                  </span>
                </button>

                {/* Items */}
                {items.length > 0 && (
                  <ul className="mt-0.5 space-y-0.5 pl-3 border-l border-gray-100 ml-4">
                    {items.map((item) => {
                      const op = id === "operations" ? operations[item] : null;
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
                                ? "bg-orange-50 text-orange-700 font-medium"
                                : isActive
                                ? "text-gray-700 hover:text-gray-900 hover:bg-orange-50"
                                : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {actionColor && (
                              <span className={`shrink-0 text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${actionColor}`}>
                                {action}
                              </span>
                            )}
                            <span className="truncate">{item}</span>
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
