import React from 'react';

interface SchemaViewerProps {
  schema: object;
  title?: string;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema, title }) => {
  return (
    <div className="p-4 border rounded shadow">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(schema, null, 2)}
      </pre>
    </div>
  );
};
