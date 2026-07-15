/**
 * Lightweight structural validation of an Avro schema definition.
 *
 * Replaces the `avsc.Type.forSchema` validation used by
 * @asyncapi/avro-schema-parser — `avsc` depends on Node's Buffer, which is
 * why the lib previously could not support Avro in the browser. This validator
 * only checks the structure needed for a safe conversion; it is not a full
 * Avro spec validator.
 */
import { isSchemaRecord } from "../../types/schema";

const PRIMITIVE_TYPES = new Set([
  "null",
  "boolean",
  "int",
  "long",
  "float",
  "double",
  "bytes",
  "string",
  "uuid",
]);

const COMPLEX_TYPES = new Set(["record", "enum", "array", "map", "fixed"]);

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/;

/** Returns a list of structural problems; an empty list means convertible. */
export function validateAvroStructure(definition: unknown): string[] {
  const problems: string[] = [];
  walk(definition, "schema", problems, new Set());
  return problems;
}

function walk(
  definition: unknown,
  path: string,
  problems: string[],
  seen: Set<unknown>,
): void {
  if (typeof definition === "string") {
    if (!PRIMITIVE_TYPES.has(definition) && !NAME_PATTERN.test(definition)) {
      problems.push(`${path}: "${definition}" is not a valid Avro type name`);
    }
    return;
  }

  if (Array.isArray(definition)) {
    if (definition.length === 0) {
      problems.push(`${path}: union must have at least one alternative`);
    }
    definition.forEach((alternative, i) =>
      walk(alternative, `${path}[${i}]`, problems, seen),
    );
    return;
  }

  if (!isSchemaRecord(definition)) {
    problems.push(`${path}: expected an Avro type string, object, or union`);
    return;
  }

  if (seen.has(definition)) return;
  seen.add(definition);

  const type = definition.type;
  if (typeof type !== "string") {
    // Avro also allows a nested definition (object or union) in type position.
    if (Array.isArray(type) || isSchemaRecord(type)) {
      walk(type, `${path}.type`, problems, seen);
    } else {
      problems.push(`${path}: missing "type"`);
    }
    return;
  }

  if (
    !PRIMITIVE_TYPES.has(type) &&
    !COMPLEX_TYPES.has(type) &&
    !NAME_PATTERN.test(type)
  ) {
    problems.push(`${path}: unknown Avro type "${type}"`);
    return;
  }

  switch (type) {
    case "record": {
      if (!Array.isArray(definition.fields)) {
        problems.push(`${path}: record must have a "fields" array`);
        return;
      }
      definition.fields.forEach((field, i) => {
        const fieldPath = `${path}.fields[${i}]`;
        if (!isSchemaRecord(field) || typeof field.name !== "string") {
          problems.push(`${fieldPath}: field must have a string "name"`);
          return;
        }
        walk(field.type, `${fieldPath}.type`, problems, seen);
      });
      break;
    }
    case "enum": {
      const symbols = definition.symbols;
      if (
        !Array.isArray(symbols) ||
        symbols.some((symbol) => typeof symbol !== "string")
      ) {
        problems.push(`${path}: enum must have a "symbols" array of strings`);
      }
      break;
    }
    case "array": {
      if (definition.items === undefined) {
        problems.push(`${path}: array must have "items"`);
      } else {
        walk(definition.items, `${path}.items`, problems, seen);
      }
      break;
    }
    case "map": {
      if (definition.values === undefined) {
        problems.push(`${path}: map must have "values"`);
      } else {
        walk(definition.values, `${path}.values`, problems, seen);
      }
      break;
    }
    case "fixed": {
      if (typeof definition.size !== "number") {
        problems.push(`${path}: fixed must have a numeric "size"`);
      }
      break;
    }
    default:
      break;
  }
}
