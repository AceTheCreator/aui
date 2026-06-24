import { useState } from "react";
import { chunkColors } from "../contants";
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const parts = parseAddress(address);
  let colorIndex = 0;

  return (
    <code className={`text-xs px-2 py-1 rounded text-neutral-700 break-all ${className ?? ""}`}>
      {parts.map((part, i) => {
        if (part.type === "text") return <span key={i}>{part.value}</span>;
        const description = parameters?.[part.value]?.description;
        const color = chunkColors[colorIndex++ % chunkColors.length];
        const isHovered = hoveredIndex === i;
        return (
          <span
            key={i}
            className="relative inline-block"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className={`font-semibold ${color} ${description ? "cursor-help underline decoration-dotted" : ""}`}>
              {`{${part.value}}`}
            </span>
            {description && isHovered && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-neutral-800 text-white text-xs rounded whitespace-nowrap pointer-events-none z-20 shadow-lg text-center leading-snug">
                {description}
              </span>
            )}
          </span>
        );
      })}
    </code>
  );
}
