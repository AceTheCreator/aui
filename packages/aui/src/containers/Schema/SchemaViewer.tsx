import React from 'react';
import { CopyButton } from '../../components/CopyButton';

interface SchemaViewerProps {
  schema: object | unknown;
  title?: string;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  // String bodies (e.g. raw .proto source) render as-is; JSON.stringify
  // would collapse them to one escaped line.
  const content =
    typeof schema === "string" ? schema : JSON.stringify(schema, null, 2);

  return (
    <div className="relative">
      <CopyButton text={content} ariaLabel="Copy schema" />
      <pre className="text-xs bg-neutral-50 text-foreground-secondary p-2 rounded overflow-x-auto">
        {content}
      </pre>
    </div>
  );
};
