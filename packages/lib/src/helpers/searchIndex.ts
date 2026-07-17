import { AsyncAPIDocumentData } from "../types/schema";
import { Server } from "../types/asyncapi/Server";

export type SearchTab = "operations" | "messages" | "schemas" | "info" | "servers";
export type SearchType = "operation" | "message" | "schema" | "info" | "server";

export interface SearchEntry {
  id: string;
  targetId: string;
  type: SearchType;
  tab: SearchTab;
  key: string;
  name: string;
  path: string;
  location: string;
  subtitle?: string;
  text: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const flattenText = (value: unknown, visited = new Set<object>()): string => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => flattenText(item, visited)).join(" ");
  }
  if (value instanceof Map) {
    return Array.from(value.entries())
      .flatMap(([key, item]) => [key, flattenText(item, visited)])
      .join(" ");
  }
  if (isRecord(value)) {
    if (visited.has(value)) return "";
    visited.add(value);
    return Object.entries(value)
      .flatMap(([key, item]) => [key, flattenText(item, visited)])
      .join(" ");
  }
  return "";
};

const normalizeString = (value: unknown): string =>
  flattenText(value).trim().replace(/\s+/g, " ");

const addSchemaEntries = (
  entries: SearchEntry[],
  schema: unknown,
  schemaKey: string,
  schemaName: string,
) => {
  const rootTargetId = `schema-${schemaKey}`;

  const addEntry = (
    node: unknown,
    pathSegments: string[],
    locationSegments: string[],
  ) => {
    const path = `components.schemas.${schemaKey}${pathSegments.length ? `.${pathSegments.join(".")}` : ""}`;
    const location = `Schemas > ${schemaName}${locationSegments.length ? ` > ${locationSegments.join(" > ")}` : ""}`;
    const subtitle = isRecord(node) ? (node.description as string | undefined) : undefined;
    const name = pathSegments.length ? `${schemaName}.${pathSegments.join(".")}` : schemaName;

    entries.push({
      id: `schema-${schemaKey}-${pathSegments.join("-") || "root"}`,
      targetId: rootTargetId,
      type: "schema",
      tab: "schemas",
      key: schemaKey,
      name,
      path,
      location,
      subtitle,
      text: normalizeString([node]),
    });
  };

  const walk = (
    node: unknown,
    pathSegments: string[] = [],
    locationSegments: string[] = [],
  ) => {
    addEntry(node, pathSegments, locationSegments);

    if (!isRecord(node)) return;

    if (isRecord(node.properties)) {
      for (const [propName, propValue] of Object.entries(node.properties)) {
        walk(propValue, [...pathSegments, "properties", propName], [...locationSegments, propName]);
      }
    }

    const items = (node as Record<string, unknown>).items;
    if (isRecord(items)) {
      walk(items, [...pathSegments, "items"], [...locationSegments, "items"]);
    } else if (Array.isArray(items)) {
      items.forEach((item, index) => {
        walk(item, [...pathSegments, `items[${index}]`], [...locationSegments, `items[${index}]`]);
      });
    }

    for (const keyword of ["allOf", "oneOf", "anyOf"] as const) {
      const branch = (node as Record<string, unknown>)[keyword];
      if (Array.isArray(branch)) {
        branch.forEach((item, index) => {
          walk(item, [...pathSegments, `${keyword}[${index}]`], [...locationSegments, `${keyword}[${index}]`]);
        });
      }
    }

    if (isRecord((node as Record<string, unknown>).additionalProperties)) {
      walk(
        (node as Record<string, unknown>).additionalProperties,
        [...pathSegments, "additionalProperties"],
        [...locationSegments, "additionalProperties"],
      );
    }
  };

  walk(schema);
};

export function buildSearchIndex(asyncapi: AsyncAPIDocumentData): SearchEntry[] {
  const entries: SearchEntry[] = [];

  if (asyncapi.info) {
    const title = asyncapi.info.title ?? "Info";
    const subtitle = asyncapi.info.description ?? undefined;
    entries.push({
      id: "info-panel",
      targetId: "info-panel",
      type: "info",
      tab: "info",
      key: "info",
      name: title,
      path: "info",
      location: "Info",
      subtitle,
      text: normalizeString([
        asyncapi.info,
        asyncapi.info.title,
        asyncapi.info.description,
        asyncapi.info.license,
        asyncapi.info.externalDocs,
        asyncapi.info.contact,
        asyncapi.info.tags,
      ]),
    });
  }

  if (asyncapi.servers) {
    for (const [key, server] of Object.entries(asyncapi.servers)) {
      const serverData = server as Server;
      const title = serverData.description ?? key;
      const subtitle = [serverData.protocol, serverData.host].filter(Boolean).join(" ");
      entries.push({
        id: `server-${key}`,
        targetId: `server-${key}`,
        type: "server",
        tab: "servers",
        key,
        name: key,
        path: `servers.${key}`,
        location: `Servers > ${key}`,
        subtitle,
        text: normalizeString([
          key,
          title,
          subtitle,
          serverData.description,
          serverData.protocol,
          serverData.host,
          serverData.variables,
          serverData.security,
          serverData.bindings,
        ]),
      });
    }
  }

  if (asyncapi.operations) {
    for (const [key, operation] of Object.entries(asyncapi.operations)) {
      const name = operation.title ?? key;
      const subtitle = operation.summary ?? operation.description ?? operation.action ?? "";
      entries.push({
        id: `operation-${key}`,
        targetId: `operation-${key}`,
        type: "operation",
        tab: "operations",
        key,
        name,
        path: `operations.${key}`,
        location: `Operations > ${name}`,
        subtitle,
        text: normalizeString([
          key,
          name,
          subtitle,
          operation.action,
          operation.channel,
          operation.messages,
          operation.reply,
          operation.traits,
          operation.bindings,
          operation.security,
          operation.tags,
        ]),
      });
    }
  }

  if (asyncapi.components?.messages) {
    for (const [key, message] of Object.entries(asyncapi.components.messages)) {
      const name = message.title ?? message.name ?? key;
      const subtitle = message.summary ?? message.description ?? message.contentType ?? "";
      entries.push({
        id: `message-${key}`,
        targetId: `message-${key}`,
        type: "message",
        tab: "messages",
        key,
        name,
        path: `components.messages.${key}`,
        location: `Messages > ${name}`,
        subtitle,
        text: normalizeString([
          key,
          name,
          subtitle,
          message.contentType,
          message.payload,
          message.headers,
          message.correlationId,
          message.tags,
          message.externalDocs,
          message.bindings,
        ]),
      });
    }
  }

  if (asyncapi.components?.schemas) {
    for (const [key, schema] of Object.entries(asyncapi.components.schemas)) {
      addSchemaEntries(entries, schema, key, key);
    }
  }

  return entries;
}
