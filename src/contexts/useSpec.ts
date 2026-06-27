import { createContext, useContext } from "react";

type AsyncAPIDocument = Record<string, unknown>;

interface AsyncAPIContextValue {
  document: AsyncAPIDocument;
  deref: (ref: string) => unknown;
  portalHost: HTMLElement | null;
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
