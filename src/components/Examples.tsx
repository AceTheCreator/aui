import {use, useMemo} from "react";
import {generate} from "json-schema-faker";

interface ExamplesProps {
    schema: any;
}

export function Examples ({schema}: ExamplesProps) {
    const value = use(useMemo(() => generate(schema), [schema]));
    return (
      <div className="text-xs bg-gray-50 text-gray-700 p-2 rounded overflow-x-auto">
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
}
