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
      className="inline-flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-md border border-gray-200"
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
                ? "px-3 py-1 text-xs font-semibold text-gray-900 bg-white rounded-md shadow-sm border border-gray-200"
                : "px-3 py-1 text-xs font-medium text-gray-400 hover:text-gray-600 rounded-md"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
