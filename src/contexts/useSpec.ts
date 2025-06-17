import { createContext, useContext } from "react";

type AsyncAPIDocument = Record<string, any>;

interface AsyncAPIContextValue {
  document: AsyncAPIDocument;
  deref: (refPath: string) => any;
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
