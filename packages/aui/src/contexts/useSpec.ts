import { createContext, useContext } from "react";

type AsyncAPIDocument = Record<string, unknown>;

interface AsyncAPIContextValue {
  document: AsyncAPIDocument;
  /** Resolves a JSON Pointer $ref string to the object it references in the document. */
  deref: (ref: string) => unknown;
  portalHost: HTMLElement | null;
  /** Whether schema tree nodes start expanded by default. Defaults to false. */
  defaultSchemaExpanded?: boolean;
}

export const AsyncAPIDocumentContext =
  createContext<AsyncAPIContextValue | null>(null);

export const useAsyncAPIDocument = () => {
  const context = useContext(AsyncAPIDocumentContext);
  if (!context) {
    throw new Error(
      "useAsyncAPIDocument must be used within an AsyncAPIDocumentProvider"
    );
  }
  return context;
};
