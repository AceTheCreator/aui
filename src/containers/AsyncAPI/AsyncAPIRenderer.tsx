import { useEffect, useState } from "react";
import AsyncAPI from "./AsyncAPI";
import type { ConfigInterface } from "../../config/config";
import { parseDocument } from "../../helpers/parser";

interface AsyncAPIRendererProps {
  raw: string;
  config?: ConfigInterface;
  onDiagnostics?: (diagnostics: unknown[]) => void;
}

export function AsyncAPIRenderer({ raw, config, onDiagnostics }: AsyncAPIRendererProps) {
  const [view, setView] = useState<React.ReactNode>(null);

  useEffect(() => {
    let render = true;
    parseDocument(raw).then(({ document, diagnostics }) => {
      if (!render) return;
      setView(document ? <AsyncAPI kind="resolved" doc={document} config={config} /> : null);
      onDiagnostics?.(diagnostics);
    });
    return () => {
      render = false;
    };
  }, [raw, config, onDiagnostics]);

  return view;
}
