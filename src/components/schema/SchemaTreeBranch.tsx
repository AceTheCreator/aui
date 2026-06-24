import type { ReactNode } from "react";
import { getDepthColors } from "./depthColors";

export type SchemaTreeBranchLineVariant = "depth" | "muted" | "none";

const MUTED_LINE = "ml-0 border-dashed border-gray-300";

/** Indented child container with a depth-colored left line — no box borders. */
export default function SchemaTreeBranch({
  depth,
  children,
  lineVariant = "depth",
}: {
  depth: number;
  children: ReactNode;
  lineVariant?: SchemaTreeBranchLineVariant;
}) {
  if (lineVariant === "none") {
    return <div>{children}</div>;
  }

  const lineClass =
    lineVariant === "muted"
      ? MUTED_LINE
      : `ml-1.5 ${getDepthColors(depth).line}`;

  return <div className={`pl-3 border-l-2 ${lineClass}`}>{children}</div>;
}
