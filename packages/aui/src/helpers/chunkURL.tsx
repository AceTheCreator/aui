import type { JSX } from "react";
import { chunkColors } from "../contants";
import { Server as ServerInterface } from "../types/asyncapi/Server";
import { ServerVariable } from "../types/asyncapi/ServerVariable";

export function chunkURL(
  host?: string | null,
  variables?: ServerInterface["variables"],
) {
  if (!host) {
    return null;
  }

  // `variables` is typed as a Map (a codegen artifact from the AsyncAPI JSON schema),
  // but parsed documents are always plain objects at runtime — never real Map instances.
  const variableEntries = variables as unknown as Record<string, ServerVariable> | undefined;

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
              ? variableEntries?.[variableName]?.description || undefined
              : undefined
          }
        >
          {chunk}
        </span>
      );
    },
  );
}
