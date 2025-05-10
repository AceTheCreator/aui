import { useState } from "react";
import IconArrowRight from "../icons/ArrowRight";
import IconDownRight from "../icons/ArrowDown";

const mqttSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "http://asyncapi.com/bindings/mqtt/0.1.0/server.json",
  title: "MQTT server bindings object",
  description:
    "This object contains information about the server representation in MQTT.",
  type: "object",
  additionalProperties: false,
  patternProperties: {
    "^x-[\\w\\d\\.\\x2d_]+$": {
      $ref: "http://asyncapi.com/definitions/3.0.0/specificationExtension.json",
    },
  },
  properties: {
    clientId: {
      type: "string",
      description: "The client identifier.",
    },
    cleanSession: {
      type: "boolean",
      description:
        "Whether to create a persistent connection or not. When 'false', the connection will be persistent.",
    },
    lastWill: {
      type: "object",
      description: "Last Will and Testament configuration.",
      properties: {
        topic: {
          type: "string",
          description:
            "The topic where the Last Will and Testament message will be sent.",
        },
        qos: {
          type: "integer",
          enum: [0, 1, 2],
          description:
            "Defines how hard the broker/client will try to ensure that the Last Will and Testament message is received. Its value MUST be either 0, 1 or 2.",
        },
        message: {
          type: "string",
          description: "Last Will message.",
        },
        retain: {
          type: "boolean",
          description:
            "Whether the broker should retain the Last Will and Testament message or not.",
        },
      },
    },
    keepAlive: {
      type: "integer",
      description:
        "Interval in seconds of the longest period of time the broker and the client can endure without sending a message.",
    },
    bindingVersion: {
      type: "string",
      enum: ["0.1.0"],
      description:
        "The version of this binding. If omitted, 'latest' MUST be assumed.",
    },
  },
  examples: [
    {
      clientId: "guest",
      cleanSession: true,
      lastWill: {
        topic: "/last-wills",
        qos: 2,
        message: "Guest gone offline.",
        retain: false,
      },
      keepAlive: 60,
      bindingVersion: "0.1.0",
    },
  ],
};

export default function Bindings({ type, bindings, expand }) {
  const [expanded, setExpanded] = useState(expand);

  //   if (!bindings || Object.keys(bindings).length === 0) {
  //     return null;
  //   }

  return (
    <div className="mt-2 rounded-lg bg-gray-200 border border-gray-500">
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* <Server size={16} className="mr-2 text-gray-600" /> */}
        <span className="text-sm font-medium text-gray-700">
          This server accepts the following connection configuration
        </span>
        {expanded ? (
          <IconDownRight className="w-[25px] text-gray-500" />
        ) : (
          <IconArrowRight className="w-[25px] text-gray-500" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-500 p-2">
          <SchemaBasedRenderer data={bindings} schema={mqttSchema} />
        </div>
      )}
    </div>
  );
}

const SchemaBasedRenderer = ({ data, schema, path = "", level = 0 }) => {
  // If schema is not an object or has no properties, fall back to JSON display
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
                {/* {propSchema.description && (
                          <div className="ml-1 group relative">
                            <InfoIcon size={14} className="text-gray-400" />
                            <div className="hidden group-hover:block absolute z-10 w-64 p-2 mt-1 text-xs bg-white border border-gray-200 rounded shadow-lg">
                              {propSchema.description}
                            </div>
                          </div>
                        )} */}
                {/* {(schema.required || []).includes(propName) && (
                          <span className="ml-1 text-red-500 text-xs">*</span>
                        )} */}
              </div>
              <div
                className={`${
                  level % 2 === 0 && "bg-white"
                } my-2 px-4 py-[2px] rounded`}
              >
                <SchemaBasedRenderer
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
          <div key={propName} className="my-4 text-sm">
            <div className="flex justify-between w-[40%]">
              <div>
                <a title={propSchema.description}>
                  <span className="font-medium hover:text-gray-700">
                    {propName}
                  </span>
                </a>
              </div>
              <div className="w-[20px]">
                {renderByType(propSchema, value, fullPath)}
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
          <SchemaBasedRenderer schema={propSchema} data={value} path={path} />
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
      return <span className="text-black">{value.toString()}</span>;
  }
};
