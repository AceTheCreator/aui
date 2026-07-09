import { useEffect, useRef, useState } from "react";
import AsyncAPI from "./AsyncAPI";
import type { AsyncAPIDocumentData } from "../../types/schema";
import type { ConfigInterface } from "../../config/config";
import { parseDocument } from "../../helpers/parser";

interface AsyncAPIRendererProps {
  raw: string;
  config?: ConfigInterface;
  onDiagnostics?: (diagnostics: unknown[]) => void;
}

export function AsyncAPIRenderer({ raw, config, onDiagnostics }: AsyncAPIRendererProps) {
  const [parsedDoc, setParsedDoc] = useState<AsyncAPIDocumentData | null>(null);

  // Keep the latest onDiagnostics without making the effect below re-run (and
  // therefore re-parse) whenever the caller passes a new callback identity.
  const onDiagnosticsRef = useRef(onDiagnostics);
  onDiagnosticsRef.current = onDiagnostics;

  useEffect(() => {
    let active = true;
    parseDocument(raw).then(({ document, diagnostics }) => {
      if (!active) return;
      setParsedDoc(document);
      onDiagnosticsRef.current?.(diagnostics);
    });
    return () => {
      active = false;
    };
    // Only re-parse when the raw document text changes — `config` (e.g. a theme
    // toggle) should re-render immediately with the already-parsed document,
    // not wait on a fresh ~500ms parse.
  }, [raw]);

  if (!parsedDoc) return null;
  return <AsyncAPI kind="resolved" doc={parsedDoc} config={config} />;
}
