import { useMemo } from "react";
import { AsyncAPIDocumentContext } from "../contexts/index";
import Information from "./Information/Information";
import Servers from "./Server/Servers";
import Operations from "./Operation/Operations";

export interface IAsyncAPIProps {}

const AsyncAPI: React.FunctionComponent<IAsyncAPIProps> = ({ asyncapi }) => {
  const derefCache = useMemo(() => new Map<string, any>(), []);

  const deref = (refPath: string) => {
    if (derefCache.has(refPath)) return derefCache.get(refPath);

    const parts = refPath.replace(/^#\//, "").split("/");
    let current: any = asyncapi;
    for (const part of parts) {
      current = current?.[part];
      if (!current) break;
    }

    if (current) {
      derefCache.set(refPath, current);
    }

    return current;
  };

  const value = useMemo(() => ({ document: asyncapi, deref }), [asyncapi]);
  return (
    <AsyncAPIDocumentContext.Provider value={value}>
      <Information {...asyncapi.info} />
      <Servers servers={asyncapi.servers} />
      <Operations {...asyncapi.operations} />
    </AsyncAPIDocumentContext.Provider>
  );
};

export default AsyncAPI;
