import React from "react";

const SchemaRenderer: React.FunctionComponent = ({
  data,
  schema,
  path = "",
  level = 0,
}) => {
  if (!schema || schema.type !== "object" || !schema.properties) {
    return (
      <pre className="mt-1 rounded bg-gray-100 p-2 text-xs overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  return (
    <div className="pl-1 border-gray-200">
      {Object.entries(schema.properties).map(([propName, propSchema]) => {
        const value = data?.[propName];
        const isPresent = value !== undefined;
        const fullPath = path ? `${path}.${propName}` : propName;
        // Skip rendering if value is undefined and not required
        if (!isPresent && !(schema.required || []).includes(propName)) {
          return null;
        }

        if (propSchema.type === "object" && value) {
          return (
            <div key={propName} className="my-4">
              <div className="flex items-center">
                <div>
                  <a title={propSchema.description}>
                    <span className="text-sm hover:text-gray-700">
                      {propName}
                    </span>
                  </a>
                </div>
              </div>
              <div
                className={`${
                  level % 2 === 0 && "bg-white"
                } my-2 px-4 py-[2px] rounded`}
              >
                <SchemaRenderer
                  schema={propSchema}
                  data={value}
                  path={fullPath}
                  level={level + 1}
                />
              </div>
            </div>
          );
        }

        return (
          <div key={propName} className="my-4 text-sm w-[80%]">
            <div className="flex flex-column w-[100%]">
              <div>
                <a title={propSchema.description}>
                  <span className="font-medium hover:text-gray-700">
                    {propName}
                  </span>
                </a>
                <div className="ml-[5px] mt-2">
                  <span className="text-xs text-gray-500">
                    {propSchema.description}
                  </span>
                </div>
              </div>
              <div className="w-full  w-[80%]">
                <div className="float-right">
                  <div className="min-w-[200px]">
                    {renderByType(propSchema, value, fullPath)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const renderByType = (propSchema, value, path) => {
  if (!value) {
    return <span className="text-gray-400 text-xs italic">Not specified</span>;
  }

  switch (propSchema.type) {
    case "object":
      return (
        <div>
          <SchemaRenderer schema={propSchema} data={value} path={path} />
        </div>
      );

    case "array":
      return (
        <div className="text-xs">
          {value.map((item, idx) => (
            <div key={idx} className="mt-1 first:mt-0">
              {idx + 1}. {renderByType(schema.items, item, `${path}[${idx}]`)}
            </div>
          ))}
        </div>
      );

    case "boolean":
      return (
        <span className={value ? "text-green-600" : "text-red-600"}>
          {value.toString()}
        </span>
      );

    case "integer":
    case "number":
      return <span className="text-blue-600">{value}</span>;

    default:
      if (typeof value === "string" && value.includes("{")) {
        const parts = value.split(/(\{[^}]+\})/g);
        return (
          <span>
            {parts.map((part, idx) =>
              part.startsWith("{") ? (
                <span key={idx} className="text-purple-600">
                  {part}
                </span>
              ) : (
                <span key={idx}>{part}</span>
              )
            )}
          </span>
        );
      }
      return <span className="text-black w-full">{value.toString()}</span>;
  }
};

export default SchemaRenderer;
