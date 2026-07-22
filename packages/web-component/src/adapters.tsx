import AsyncAPI, { AsyncAPIRenderer } from "apiuikit";
import type { ConfigInterface, AsyncAPIDocumentData } from "apiuikit";

export interface AsyncApiElementProps {
  spec?: AsyncAPIDocumentData;
  resolved?: boolean;
  config?: ConfigInterface;
}

export function AsyncApiElement({ spec, resolved, config }: AsyncApiElementProps) {
  if (!spec) return null;
  return resolved ? (
    <AsyncAPI kind="resolved" asyncapi={spec} config={config} />
  ) : (
    <AsyncAPI asyncapi={spec} config={config} />
  );
}

export interface AsyncApiRendererElementProps {
  spec?: string;
  config?: ConfigInterface;
  onDiagnostics?: (diagnostics: unknown[]) => void;
}

export function AsyncApiRendererElement({ spec, config, onDiagnostics }: AsyncApiRendererElementProps) {
  if (!spec) return null;
  return <AsyncAPIRenderer raw={spec} config={config} onDiagnostics={onDiagnostics} />;
}
