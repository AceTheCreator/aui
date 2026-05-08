import { useCallback, useEffect, useMemo, useState } from "react";
import { AsyncAPIDocumentContext } from "../contexts/index";
import ContentTab, { ContentTabItem } from "../components/ContentTab";
import { Info } from "../types/asyncapi/Info";
import { Server } from "../asyncapi-models/Server";
import { Operation } from "../types/asyncapi/Operation";
import IconMessage from "../icons/Message";
import IconOperation from "../icons/Operation";
import IconSchema from "../icons/Schema";
import Information from "./Information/Information";
import Messages from "./Messages/Messages";
import Servers from "./Server/Servers";
import Operations from "./Operation/Operations";
import Schemas from "./Schema/Schemas";

interface AsyncAPIMessageDefinition {
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  contentType?: string;
  payload?: Record<string, unknown> & {
    type?: string;
  };
}

interface AsyncAPISchemaDefinition extends Record<string, unknown> {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, unknown>;
}

interface AsyncAPIDocumentData extends Record<string, unknown> {
  info: Info;
  servers?: Record<string, Server>;
  operations?: Record<string, Operation>;
  components?: {
    messages?: Record<string, AsyncAPIMessageDefinition>;
    schemas?: Record<string, AsyncAPISchemaDefinition>;
  };
}

export interface IAsyncAPIProps {
  asyncapi: AsyncAPIDocumentData;
}

type AsyncAPITabKey = "operations" | "messages" | "schemas";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAsyncAPITabKey = (value: string): value is AsyncAPITabKey =>
  value === "operations" || value === "messages" || value === "schemas";

const AsyncAPI = ({ asyncapi }: IAsyncAPIProps) => {
  const [activeTab, setActiveTab] = useState<AsyncAPITabKey>("operations");
  const derefCache = useMemo(() => new Map<string, unknown>(), []);

  useEffect(() => {
    derefCache.clear();
  }, [asyncapi, derefCache]);

  const deref = useCallback((refPath: string) => {
    if (derefCache.has(refPath)) return derefCache.get(refPath);

    const parts = refPath.replace(/^#\//, "").split("/");
    let current: unknown = asyncapi;

    for (const part of parts) {
      if (!isRecord(current)) {
        current = undefined;
        break;
      }

      current = current[part];

      if (current == null) break;
    }

    if (current !== undefined) {
      derefCache.set(refPath, current);
    }

    return current;
  }, [asyncapi, derefCache]);

  const value = useMemo(
    () => ({ document: asyncapi, deref }),
    [asyncapi, deref]
  );

  const tabs: ContentTabItem[] = [
    {
      id: "operations",
      name: "Operations",
      icon: IconOperation,
    },
    {
      id: "messages",
      name: "Messages",
      icon: IconMessage,
    },
    {
      id: "schemas",
      name: "Schemas",
      icon: IconSchema,
    },
  ];

  const activeContent =
    activeTab === "operations" ? (
      <Operations operations={asyncapi.operations ?? {}} />
    ) : activeTab === "messages" ? (
      <Messages messages={asyncapi.components?.messages ?? {}} />
    ) : (
      <Schemas schemas={asyncapi.components?.schemas ?? {}} />
    );

  return (
    <AsyncAPIDocumentContext.Provider value={value}>
      <Information {...asyncapi.info} />
      {asyncapi.servers && Object.keys(asyncapi.servers).length > 0 && (
        <Servers servers={asyncapi.servers} />
      )}
      <ContentTab
        tabs={tabs}
        current={activeTab}
        onChange={(id) => {
          if (isAsyncAPITabKey(id)) {
            setActiveTab(id);
          }
        }}
      />
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeContent}
      </div>
    </AsyncAPIDocumentContext.Provider>
  );
};

export default AsyncAPI;
