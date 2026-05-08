import { chunkColors } from "../contants";
import { ServerInterface } from "../types/server";

export function chunkURL(
  host?: string | null,
  variables?: ServerInterface["variables"],
) {
  if (!host) {
    return null;
  }

  let colorIndex = 0;

  return (host.match(/({[\w\d\s\-_]+})|([^{]+)/gi) || []).map(
    (chunk, index): JSX.Element => {
      const isVariable = chunk.startsWith("{");
      const variableName = isVariable ? chunk.slice(1, -1) : "";

      return (
        <span
          key={index}
          className={
            isVariable ? chunkColors[colorIndex++ % chunkColors.length] : ""
          }
          title={
            isVariable
              ? variables?.[variableName]?.description || undefined
              : undefined
          }
        >
          {chunk}
        </span>
      );
    },
  );
}
