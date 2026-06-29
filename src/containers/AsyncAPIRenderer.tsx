import { useEffect, useState } from "react";
import { parseAndRender } from "../helpers/parser";
import type { ConfigInterface } from "../config/config";

interface AsyncAPIRendererProps {
  raw: string;
  config?: ConfigInterface;
  onDiagnostics?: (diagnostics: unknown[]) => void;
}

export function AsyncAPIRenderer({ raw, config, onDiagnostics }: AsyncAPIRendererProps) {
  const [view, setView] = useState<React.ReactNode>(null);

  useEffect(() => {
    let render = true;
    parseAndRender(raw, config).then((response) => {
      if (!render) return;
      setView(response.view);
      onDiagnostics?.(response.diagnostics);
    });
    return () => {
      render = false;
    };
  }, [raw, config, onDiagnostics]);

  return view;
}
