import type { ReactNode } from "react";
import { getDepthColors } from "./depthColors";

/** Indented child container with a depth-colored left line — no box borders. */
export default function SchemaTreeBranch({
  depth,
  children,
}: {
  depth: number;
  children: ReactNode;
}) {
  const colors = getDepthColors(depth);
  return (
    <div className={`ml-1.5 pl-3 border-l-2 ${colors.line}`}>{children}</div>
  );
}
