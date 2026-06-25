import { useId } from "react";
import type { ComponentType } from "react";
import classNames from "../helpers/classNames";

export type Tab = {
  id: string;
  name: string;
  icon?: ComponentType<{ className?: string }>;
};

interface TabsProps {
  tabs: Tab[];
  current: string | null;
  onChange?: (id: string) => void;
  ariaLabel?: string;
  selectLabel?: string;
}

export default function Tabs({
  tabs,
  current,
  onChange = () => {},
  ariaLabel = "Tabs",
  selectLabel = "Select a tab",
}: TabsProps) {
  const selectId = useId();
  const selectValue = current ?? tabs[0]?.id ?? "";
  const hasIcons = tabs.some((tab) => Boolean(tab.icon));

  if (!tabs.length) {
    return null;
  }

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor={selectId} className="sr-only">
          {selectLabel}
        </label>
        <select
          id={selectId}
          name="tabs"
          value={selectValue}
          onChange={(ev) => onChange(ev.target.value)}
          className={classNames(
            "block w-full rounded-md border-neutral-300 focus:border-secondary-500 focus:ring-secondary-500",
            hasIcons ? "mt-0" : "mt-4"
          )}
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>

      <div className={classNames("hidden sm:block", hasIcons ? "" : "mt-6")}>
        {hasIcons ? (
          <div
            className="border-b border-border"
            role="tablist"
            aria-label={ariaLabel}
          >
            <div className="flex flex-wrap gap-6">
              {tabs.map((tab) => {
                const isActive = tab.id === current;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => onChange(tab.id)}
                    className={classNames(
                      "border-b-2 px-1 py-3 text-sm font-semibold transition-colors",
                      isActive
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-foreground-muted hover:text-foreground"
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                      <span>{tab.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <nav
            className="relative z-0 flex divide-x divide-border rounded-lg shadow"
            aria-label={ariaLabel}
          >
            {tabs.map((tab, tabIdx) => (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={classNames(
                  tab.id === current
                    ? "text-foreground"
                    : "text-foreground-muted hover:text-foreground-secondary",
                  tabIdx === 0 ? "rounded-l-lg" : "",
                  tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
                  "group relative min-w-0 flex-1 overflow-hidden bg-surface px-4 py-4 text-center text-sm font-medium hover:bg-neutral-50 focus:z-10"
                )}
                aria-current={tab.id === current ? "page" : undefined}
              >
                <span>{tab.name}</span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    tab.id === current ? "bg-secondary-500" : "bg-transparent",
                    "absolute inset-x-0 bottom-0 h-0.5"
                  )}
                />
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
