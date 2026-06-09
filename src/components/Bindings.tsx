import { useState } from "react";
import IconArrowRight from "../icons/ArrowRight";
import IconDownRight from "../icons/ArrowDown";
import { PROTOCOL_META } from "../contants";


function prettyKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^(.)/, (c) => c.toUpperCase())
    .trim();
}

function isUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
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
            <span key={i} className="text-xs font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
              {String(v)}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div className="mt-1 border-l-2 border-gray-200 pl-3 space-y-2">
        {Object.entries(obj).map(([k, v]) => (
          <div key={k} className="flex items-start gap-2">
            <span className="text-xs text-gray-400 shrink-0 w-36">{prettyKey(k)}</span>
            <BindingValue value={v} />
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-xs text-gray-700">{String(value)}</span>;
}

interface Props {
  bindings: Record<string, unknown>;
  expand?: boolean;
  protocol: string;
}

export default function Bindings({ bindings, expand = true, protocol }: Props) {
  const [expanded, setExpanded] = useState(expand);
  const meta = PROTOCOL_META[protocol.toLowerCase()] ?? { label: protocol, color: "bg-gray-100 text-gray-700 border-gray-200" };

  const entries = Object.entries(bindings ?? {}).filter(
    ([k, v]) => k !== "bindingVersion" && v !== undefined && v !== null
  );

  if (entries.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        {expanded ? (
          <IconDownRight className="w-4 h-4 text-gray-400" />
        ) : (
          <IconArrowRight className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {expanded && (
        <div className="divide-y divide-gray-100">
          {entries.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400 italic">No binding properties defined.</p>
          ) : (
            entries.map(([key, value]) => (
              <div key={key} className="flex items-center items-start gap-4 px-4 py-3">
                <span className="text-xs font-medium text-gray-500 w-40 shrink-0 pt-0.5">
                  {prettyKey(key)}
                </span>
                <div className="flex-1 min-w-0">
                  <BindingValue name={key} value={value} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
