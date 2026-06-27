import {use, useMemo} from "react";
import {generate} from "json-schema-faker";

interface ExamplesProps {
    schema: any;
}

type JsonSchema = Record<string, unknown>;

function extendExampleSchema(schema: JsonSchema): JsonSchema {
    if (schema.type === "object" && schema.properties && typeof schema.properties === "object") {
        const enriched: Record<string, JsonSchema> = {};
        for (const [key, value] of Object.entries(schema.properties as Record<string, JsonSchema>)) {
            const isIdField = /id$/i.test(key) && value.type === "string" && !value.format && !value.examples;
            const isPlainString = value.type === "string" && !value.format && !value.examples && !value.enum;
            enriched[key] = isIdField
                ? { ...value, format: "uuid" }
                : isPlainString
                ? { ...value, examples: ["string"] }
                : extendExampleSchema(value);
        }
        return { ...schema, properties: enriched };
    }
    return schema;
}

export function Examples ({schema}: ExamplesProps) {
    const value = use(useMemo(() => generate(extendExampleSchema(schema), { seed: 42, useExamplesValue: true, optionalsProbability: 1 }), [schema]));
    return (
      <div className="text-xs bg-neutral-50 text-foreground-secondary p-2 rounded overflow-x-auto">
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
}
