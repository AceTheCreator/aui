import type { ReactNode } from "react";

interface SchemaUnionBranchProps {
  variant?: "oneOf" | "anyOf";
  caseCount: number;
  caseLabels?: string[];
  selectedCase: number;
  onSelectCase: (index: number) => void;
  children: ReactNode;
}

/** Tabbed branch UI for oneOf/anyOf schemas — shows one case at a time. */
export default function SchemaUnionBranch({
  variant = "oneOf",
  caseCount,
  caseLabels,
  selectedCase,
  onSelectCase,
  children,
}: SchemaUnionBranchProps) {
  if (caseCount === 0) return null;

  const labels =
    caseLabels?.length === caseCount
      ? caseLabels
      : Array.from({ length: caseCount }, (_, index) => `case ${index + 1}`);

  const keyword = variant === "anyOf" ? "anyof" : "oneof";
  const variantLabel = variant === "anyOf" ? "Any of:" : "One of:";
  const ariaLabel = variant === "anyOf" ? "Any of cases" : "One of cases";

  return (
    <div className="py-2">
      <div className="flex flex-col items-start">
        <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md bg-white">
          {variantLabel}
        </span>
        <div
          className="w-px h-3 bg-gray-300 ml-[1.125rem]"
          aria-hidden="true"
        />
      </div>

      <div
        className="inline-flex items-center gap-0.5 p-1 bg-gray-100 rounded-full border border-gray-200"
        role="tablist"
        aria-label={ariaLabel}
      >
        {labels.map((label, index) => {
          const isActive = index === selectedCase;
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${keyword}-case-panel-${index}`}
              id={`${keyword}-case-tab-${index}`}
              onClick={() => onSelectCase(index)}
              className={
                isActive
                  ? "px-3 py-1 text-xs font-semibold text-gray-900 bg-white rounded-full shadow-sm border border-gray-200"
                  : "px-3 py-1 text-xs font-medium text-gray-400 hover:text-gray-600 rounded-full"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        id={`${keyword}-case-panel-${selectedCase}`}
        role="tabpanel"
        aria-labelledby={`${keyword}-case-tab-${selectedCase}`}
        className="mt-2"
      >
        {children}
      </div>
    </div>
  );
}
