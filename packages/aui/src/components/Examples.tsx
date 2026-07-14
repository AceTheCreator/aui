import {useEffect, useState} from "react";
import {generate} from "json-schema-faker";
import { CodeBlock } from "./CodeBlock";

type JsonSchema = Record<string, unknown>;

interface ExamplesProps {
    schema: JsonSchema;
}

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
    const [value, setValue] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;
        generate(extendExampleSchema(schema), { seed: 42, useExamplesValue: true, optionalsProbability: 1 }).then((result) => {
            if (!cancelled) setValue(result);
        });
        return () => {
            cancelled = true;
        };
    }, [schema]);

    if (value === null) return null;

    const json = JSON.stringify(value, null, 2);

    return (
      <div>
        <CodeBlock code={json} />
        <span className="text-xs text-foreground-muted italic mt-2 font-bold inline-block">
          This example is auto generated
        </span>
      </div>
    );
}
