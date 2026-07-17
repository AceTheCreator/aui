import { useEffect, useId, useState } from "react";
import IconArrowRight from "../icons/ArrowRight";
import IconDownRight from "../icons/ArrowDown";
import { PROTOCOL_META } from "../contants";
import { isUrl } from "../helpers/common";

function prettyKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^(.)/, (c) => c.toUpperCase())
    .trim();
}

function BindingValue({ value }: { value: unknown }): React.ReactElement | null {
  if (value === undefined || value === null) return null;

  if (typeof value === "string" && isUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-blue-600 underline underline-offset-2 break-all hover:text-blue-800"
      >
        {value}
      </a>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span className={`text-xs font-medium ${value ? "text-green-600" : "text-red-500"}`}>
        {value ? "true" : "false"}
      </span>
    );
  }

  if (typeof value === "number") {
    return <span className="text-xs font-mono text-blue-600">{value}</span>;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("type" in obj && Array.isArray(obj.enum)) {
      return (
        <div className="flex flex-wrap gap-1">
          {(obj.enum as unknown[]).map((v, i) => (
            <span key={i} className="text-xs font-mono bg-neutral-100 text-foreground-secondary px-1.5 py-0.5 rounded">
              {String(v)}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div className="mt-1 border-l-2 border-border pl-3 space-y-2">
        {Object.entries(obj).map(([k, v]) => (
          <div key={k} className="flex items-start gap-2">
            <span className="text-xs text-foreground-muted shrink-0 w-36">{prettyKey(k)}</span>
            <BindingValue value={v} />
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-xs text-foreground-secondary">{String(value)}</span>;
}

interface Props {
  bindings: Record<string, unknown>;
  expand?: boolean;
  protocol: string;
  /** Forces this block open — e.g. when search navigates directly to it. */
  focused?: boolean;
}

export default function Bindings({ bindings, expand = false, protocol, focused }: Props) {
  const [expanded, setExpanded] = useState(expand);
  useEffect(() => {
    if (focused) setExpanded(true);
  }, [focused]);
  const meta = PROTOCOL_META[protocol.toLowerCase()] ?? { label: protocol, color: "bg-neutral-100 text-foreground-secondary border-border" };

  const entries = Object.entries(bindings ?? {}).filter(
    ([k, v]) => k !== "bindingVersion" && v !== undefined && v !== null
  );

  const panelId = useId();

  if (entries.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 bg-neutral-50 text-left hover:bg-neutral-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        {expanded ? (
          <IconDownRight className="w-4 h-4 text-foreground-muted" />
        ) : (
          <IconArrowRight className="w-4 h-4 text-foreground-muted" />
        )}
      </button>

      <div
        id={panelId}
        className={`grid transition-all duration-200 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {entries.length === 0 ? (
              <p className="px-4 py-3 text-xs text-foreground-muted italic">No binding properties defined.</p>
            ) : (
              entries.map(([key, value]) => (
                <div key={key} className="flex items-center items-start gap-4 px-4 py-3">
                  <span className="text-xs font-medium text-foreground-muted w-40 shrink-0 pt-0.5">
                    {prettyKey(key)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <BindingValue value={value} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
