interface TabToggleProps<T extends string> {
  tabs: { id: T; label: string }[];
  selected: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}

export default function TabToggle<T extends string>({
  tabs,
  selected,
  onChange,
  ariaLabel,
}: TabToggleProps<T>) {
  return (
    <div
      className="inline-flex items-center gap-0.5 p-0.5 bg-neutral-100 rounded-md border border-border"
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map(({ id, label }) => {
        const isActive = id === selected;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={
              isActive
                ? "px-3 py-1 text-xs font-semibold text-foreground bg-surface rounded-md shadow-sm border border-border"
                : "px-3 py-1 text-xs font-medium text-foreground-muted hover:text-foreground-secondary rounded-md"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
