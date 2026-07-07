import { useState } from "react";
import { createPortal } from "react-dom";
import { chunkColors } from "../contants";
import { useAsyncAPIDocument } from "../contexts";
import { Parameter } from "../types/asyncapi/Parameter";

type AddressPart = { type: "text"; value: string } | { type: "param"; value: string };

function parseAddress(address: string): AddressPart[] {
  const parts: AddressPart[] = [];
  const regex = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(address)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: address.slice(lastIndex, match.index) });
    }
    parts.push({ type: "param", value: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < address.length) {
    parts.push({ type: "text", value: address.slice(lastIndex) });
  }
  return parts;
}

interface ChannelAddressProps {
  address: string;
  parameters?: Record<string, Parameter>;
  className?: string;
}

export function ChannelAddress({ address, parameters, className }: ChannelAddressProps) {
  const { portalHost } = useAsyncAPIDocument();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: "top" as "top" | "bottom" });
  const parts = parseAddress(address);
  let colorIndex = 0;

  const TOOLTIP_CLEARANCE = 40;

  const showTooltip = (i: number, anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    const placement = rect.top < TOOLTIP_CLEARANCE ? "bottom" : "top";
    setCoords({
      top: placement === "top" ? rect.top - 8 : rect.bottom + 8,
      left: rect.left + rect.width / 2,
      placement,
    });
    setHoveredIndex(i);
  };

  return (
    <code className={`text-xs px-2 py-1 rounded text-foreground-secondary break-all ${className ?? ""}`}>
      {parts.map((part, i) => {
        if (part.type === "text") return <span key={i}>{part.value}</span>;
        const description = parameters?.[part.value]?.description;
        const color = chunkColors[colorIndex++ % chunkColors.length];
        const isHovered = hoveredIndex === i;
        return (
          <span
            key={i}
            className="inline-block"
            onMouseEnter={(e) => showTooltip(i, e.currentTarget)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className={`font-semibold ${color} ${description ? "cursor-help underline decoration-dotted" : ""}`}>
              {`{${part.value}}`}
            </span>
            {description && isHovered && portalHost &&
              createPortal(
                <span
                  className={`fixed -translate-x-1/2 px-2.5 py-1.5 bg-neutral-50 text-foreground-muted text-xs rounded whitespace-nowrap pointer-events-none z-[60] shadow-lg text-center leading-snug ${
                    coords.placement === "top" ? "-translate-y-full" : ""
                  }`}
                  style={{ top: coords.top, left: coords.left }}
                >
                  {description}
                </span>,
                portalHost
              )}
          </span>
        );
      })}
    </code>
  );
}
