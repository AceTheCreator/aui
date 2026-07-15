import { getDepthColors } from "./depthColors";

interface ExpandToggleProps {
  depth: number;
  expanded: boolean;
  onToggle: () => void;
}

/** Circular +/- toggle with optional "Show details" label when collapsed. */
export default function ExpandToggle({ depth, expanded, onToggle }: ExpandToggleProps) {
  const colors = getDepthColors(depth);
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={expanded ? "Hide details" : undefined}
      className="cursor-pointer mt-1 flex items-center gap-1.5 shrink-0 text-left hover:opacity-80"
    >
      <span
        aria-hidden="true"
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] leading-none font-bold ${colors.line} ${colors.text} hover:bg-gray-50`}
      >
        {expanded ? "−" : "+"}
      </span>
      {!expanded && (
        <span className="text-xs text-gray-500">Show details</span>
      )}
    </button>
  );
}
