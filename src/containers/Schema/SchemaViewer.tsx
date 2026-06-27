import React from 'react';

interface SchemaViewerProps {
  schema: object | unknown;
  title?: string;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  return (
      <pre className="text-xs bg-neutral-50 text-foreground-secondary p-2 rounded overflow-x-auto">
        {JSON.stringify(schema, null, 2)}
      </pre>
  );
};
