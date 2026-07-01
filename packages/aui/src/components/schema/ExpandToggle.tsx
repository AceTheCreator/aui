import { getDepthColors } from "./depthColors";

interface ExpandToggleProps {
  depth: number;
  expanded: boolean;
  onToggle: () => void;
}

/** Circular +/- button used alone at root or beside each expandable row. */
export default function ExpandToggle({ depth, expanded, onToggle }: ExpandToggleProps) {
  const colors = getDepthColors(depth);
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={expanded ? "Collapse" : "Expand"}
      className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] leading-none font-bold ${colors.line} ${colors.text} hover:bg-gray-50`}
    >
      {expanded ? "−" : "+"}
    </button>
  );
}
