import type { ReactNode } from "react";

interface SchemaNotBranchProps {
  children: ReactNode;
}

/** Branch UI for not schemas — shows the negated subschema. */
export default function SchemaNotBranch({ children }: SchemaNotBranchProps) {
  return (
    <div className="py-2">
      <div className="flex flex-col items-start">
        <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md bg-white">
          Should Not match:
        </span>
        <div
          className="w-px h-3 bg-gray-300 ml-[1.125rem]"
          aria-hidden="true"
        />
      </div>

      <div className="mt-2">{children}</div>
    </div>
  );
}

interface BooleanNotPillProps {
  value: boolean;
}

/** Compact label for boolean not subschemas (true/false). */
export function BooleanNotPill({ value }: BooleanNotPillProps) {
  const label = value ? "any value" : "false schema";

  return (
    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
      {label}
    </span>
  );
}
