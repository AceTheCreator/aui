import {useEffect, useState} from "react";
import {generate} from "json-schema-faker";
import { CodeBlock } from "./CodeBlock";

type JsonSchema = Record<string, unknown>;

interface ExamplesProps {
    schema: JsonSchema;
}

function extendExampleSchema(schema: JsonSchema, active = new Set<object>()): JsonSchema {
    // Pre-resolved documents can contain object cycles — return the node
    // unchanged on re-entry instead of recursing forever.
    if (active.has(schema)) return schema;
    if (schema.type === "object" && schema.properties && typeof schema.properties === "object") {
        active.add(schema);
        try {
            const enriched: Record<string, JsonSchema> = {};
            for (const [key, value] of Object.entries(schema.properties as Record<string, JsonSchema>)) {
                const isIdField = /id$/i.test(key) && value.type === "string" && !value.format && !value.examples;
                const isPlainString = value.type === "string" && !value.format && !value.examples && !value.enum;
                enriched[key] = isIdField
                    ? { ...value, format: "uuid" }
                    : isPlainString
                    ? { ...value, examples: ["string"] }
                    : extendExampleSchema(value, active);
            }
            return { ...schema, properties: enriched };
        } finally {
            active.delete(schema);
        }
    }
    return schema;
}

export function Examples ({schema}: ExamplesProps) {
    const [value, setValue] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;
        // Fail soft: circular or otherwise ungenerable schemas leave the tab
        // empty rather than crashing the render (generate can throw
        // synchronously or reject).
        try {
            generate(extendExampleSchema(schema), { seed: 42, useExamplesValue: true, optionalsProbability: 1 })
                .then((result) => {
                    if (!cancelled) setValue(result);
                })
                .catch(() => undefined);
        } catch {
            // leave value as null
        }
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
