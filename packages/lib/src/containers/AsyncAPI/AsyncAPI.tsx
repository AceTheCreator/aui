import { useMemo } from "react";
import { ConfigInterface, defaultConfig } from "../../config";
import { resolveDocument } from "../../helpers/resolveDocument";
import { AsyncAPIDocumentData } from "../../types/schema";
import { ErrorBoundary, ErrorBoundaryFallbackRenderer } from "../../components/ErrorBoundary";
import type { ErrorInfo, ReactNode } from "react";
import Layout from "./Layout";

export type IAsyncAPIProps =
  | AsyncAPIVariantProps
  | ({ kind: "resolved" } & AsyncAPIVariantProps);

interface AsyncAPIVariantProps {
  asyncapi: AsyncAPIDocumentData;
  config?: ConfigInterface;
  /** Custom UI shown if rendering this document throws. Defaults to a built-in fallback. */
  errorFallback?: ReactNode | ErrorBoundaryFallbackRenderer;
  /** Called once when a render error is caught, e.g. to report it to your own logging/telemetry. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

const AsyncAPI = (props: IAsyncAPIProps) => {
  const raw = props.asyncapi;
  // Always resolve: documents without $refs (including `kind: "resolved"`
  // parser output) pass through resolveDocument's cheap scan untouched —
  // identity preserved, no copy — while documents that still carry refs get
  // inlined even if the caller wrongly promised they were pre-resolved.
  const asyncapi = useMemo(() => resolveDocument(raw), [raw]);
  const config = props.config ?? defaultConfig;
  return (
    <ErrorBoundary fallback={props.errorFallback} onError={props.onError}>
      <Layout asyncapi={asyncapi} config={config} />
    </ErrorBoundary>
  );
};

export default AsyncAPI;
