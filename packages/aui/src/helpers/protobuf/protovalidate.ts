/**
 * Translates protovalidate field options — `(buf.validate.field)`, see
 * https://github.com/bufbuild/protovalidate — into JSON Schema constraints
 * (minimum/maximum, pattern, format, minItems, const, …). The option-rule
 * vocabulary is shared with protoc-gen-validate, so protocGenValidate.ts
 * delegates to the handlers exported here.
 *
 * Ported from @asyncapi/protobuf-schema-parser
 * (https://github.com/asyncapi/protobuf-schema-parser), Copyright the
 * AsyncAPI Initiative, licensed under Apache-2.0 — see THIRD_PARTY_NOTICES.md.
 * Divergences from upstream: typed against aui's SchemaNodeData, and the
 * loose `any` maps replaced with `unknown` + boundary casts (behavior
 * unchanged — the option values come from protobufjs's parsed options and
 * were never validated upstream either).
 */
import type { Field } from "protobufjs";
import type { SchemaNodeData } from "../../types/schema";

const OPTION_PREFIX = "(buf.validate.field)";

type HashMap = Record<string, unknown>;

const isRecord = (value: unknown): value is HashMap =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function visit(obj: SchemaNodeData, field: Field) {
  const parsedOption = findRootOption(field, OPTION_PREFIX);

  if (parsedOption !== null) {
    protocGenValidate(parsedOption, obj);
  }
}

export function findRootOption(
  field: Field,
  optionPrefix: string,
): null | HashMap {
  const parsedOptions = field.parsedOptions as
    | HashMap
    | HashMap[]
    | null
    | undefined;
  if (parsedOptions && !Array.isArray(parsedOptions) && parsedOptions[optionPrefix]) {
    return parsedOptions[optionPrefix] as HashMap;
  } else if (parsedOptions && Array.isArray(parsedOptions)) {
    for (const parsedOption of parsedOptions) {
      if (parsedOption[optionPrefix]) {
        return parsedOption[optionPrefix] as HashMap;
      }
    }
  }
  return null;
}

export function protocGenValidate(option: HashMap, obj: SchemaNodeData) {
  for (const [optionKey, value] of Object.entries(option)) {
    switch (optionKey) {
      case "float":
      case "double":
      case "int32":
      case "int64":
      case "uint32":
      case "uint64":
      case "sint32":
      case "sint64":
      case "fixed32":
      case "fixed64":
      case "sfixed32":
      case "sfixed64":
        ProtocGenNumeric.handle(obj, value as HashMap);
        break;

      case "bool":
        ProtocGenBool.handle(obj, value as HashMap);
        break;

      case "string":
      case "bytes":
        ProtocGenString.handle(obj, value as HashMap);
        break;

      case "repeated":
        ProtocGenRepeated.handle(obj, value as HashMap);
        break;
    }
  }
}

// https://github.com/bufbuild/protovalidate/blob/main/examples/option_number_range.proto
class ProtocGenNumeric {
  public static handle(obj: SchemaNodeData, option: HashMap) {
    for (const [optionKey, value] of Object.entries(option)) {
      switch (optionKey) {
        case "const":
          ProtocGenGeneric.constValue(obj, value as string | number | boolean);
          break;
        case "lt":
          ProtocGenNumeric.lessThan(obj, value as number);
          break;
        case "lte":
          ProtocGenNumeric.lessEqualThan(obj, value as number);
          break;
        case "gt":
          ProtocGenNumeric.greaterThan(obj, value as number);
          break;
        case "gte":
          ProtocGenNumeric.greaterEqualThan(obj, value as number);
          break;
        case "ignore_empty":
          // implemented via isOptional
          break;
        case "in":
          ProtocGenGeneric.inArray(obj, value as number[]);
          break;
        case "not_in":
          ProtocGenGeneric.notInArray(obj, value as number[]);
          break;
      }
    }
  }

  // x must equal `value` less than
  static lessThan(obj: SchemaNodeData, value: number) {
    delete obj.maximum;
    obj.exclusiveMaximum = value;
  }

  // x must be greater less or equal to `value`
  static lessEqualThan(obj: SchemaNodeData, value: number) {
    obj.maximum = value;
  }

  // x must equal `value` greater than
  static greaterThan(obj: SchemaNodeData, value: number) {
    delete obj.minimum;
    obj.exclusiveMinimum = value;
  }

  // x must be greater than or equal to `value`
  static greaterEqualThan(obj: SchemaNodeData, value: number) {
    obj.minimum = value;
  }
}

// https://github.com/bufbuild/protoc-gen-validate/blob/main/tests/harness/cases/bool.proto
class ProtocGenBool {
  public static handle(obj: SchemaNodeData, option: HashMap) {
    for (const [optionKey, value] of Object.entries(option)) {
      switch (optionKey) {
        case "const":
          ProtocGenGeneric.constValue(obj, value as boolean);
          break;
      }
    }
  }
}

// https://github.com/bufbuild/protoc-gen-validate/blob/main/tests/harness/cases/strings.proto
class ProtocGenString {
  public static handle(obj: SchemaNodeData, option: HashMap) {
    for (const [optionKey, value] of Object.entries(option)) {
      switch (optionKey) {
        case "const":
          ProtocGenGeneric.constValue(obj, value as string);
          break;

        case "in":
          ProtocGenGeneric.inArray(obj, value as string[]);
          break;
        case "not_in":
          ProtocGenGeneric.notInArray(obj, value as string[]);
          break;
        case "len":
          ProtocGenString.len(obj, value as number);
          break;
        case "min_len":
          ProtocGenString.minLen(obj, value as number);
          break;
        case "max_len":
          ProtocGenString.maxLen(obj, value as number);
          break;
        case "len_bytes":
          ProtocGenString.len(obj, value as number);
          break;
        case "min_bytes":
          ProtocGenString.minLen(obj, value as number);
          break;
        case "max_bytes":
          ProtocGenString.maxLen(obj, value as number);
          break;
        case "pattern":
          ProtocGenString.pattern(obj, value as string);
          break;
        case "prefix":
          ProtocGenString.prefix(obj, value as string);
          break;
        case "contains":
          ProtocGenString.contains(obj, value as string);
          break;
        case "not_contains":
          ProtocGenString.notContains(obj, value as string);
          break;
        case "suffix":
          ProtocGenString.suffix(obj, value as string);
          break;
        case "email":
          if (value) {
            ProtocGenString.email(obj);
          }
          break;
        case "address":
          if (value) {
            ProtocGenString.address(obj);
          }
          break;
        case "hostname":
          if (value) {
            ProtocGenString.hostname(obj);
          }
          break;
        case "ip":
          if (value) {
            ProtocGenString.ip(obj);
          }
          break;
        case "ipv4":
          if (value) {
            ProtocGenString.ipv4(obj);
          }
          break;
        case "ipv6":
          if (value) {
            ProtocGenString.ipv6(obj);
          }
          break;
        case "uri":
          if (value) {
            ProtocGenString.uri(obj);
          }
          break;
        case "uri_ref":
          if (value) {
            ProtocGenString.uriRef(obj);
          }
          break;
        case "uuid":
          if (value) {
            ProtocGenString.uuid(obj);
          }
          break;
        case "well_known_regex":
          ProtocGenString.wellKnownRegex(obj, value as string);
          break;
        case "ignore_empty":
          // implemented via isOptional
          break;
      }
    }
  }

  private static len(obj: SchemaNodeData, value: number) {
    obj.minLength = value;
    obj.maxLength = value;
  }

  private static minLen(obj: SchemaNodeData, value: number) {
    obj.minLength = value;
  }

  private static maxLen(obj: SchemaNodeData, value: number) {
    obj.maxLength = value;
  }

  private static pattern(obj: SchemaNodeData, value: string) {
    obj.pattern = value;
  }

  private static prefix(obj: SchemaNodeData, value: string) {
    obj.pattern = `^${escapeRegExp(value)}.*`;
  }

  private static contains(obj: SchemaNodeData, value: string) {
    obj.pattern = `.*${escapeRegExp(value)}.*`;
  }

  private static notContains(obj: SchemaNodeData, value: string) {
    obj.pattern = `^((?!${escapeRegExp(value)}).)*$`;
  }

  private static suffix(obj: SchemaNodeData, value: string) {
    obj.pattern = `.*${escapeRegExp(value)}$`;
  }

  private static email(obj: SchemaNodeData) {
    obj.format = "email";
  }

  private static hostname(obj: SchemaNodeData) {
    obj.format = "hostname";
  }

  private static address(obj: SchemaNodeData) {
    obj.anyOf = [{ format: "hostname" }, { format: "ipv4" }, { format: "ipv6" }];
  }

  private static ip(obj: SchemaNodeData) {
    obj.anyOf = [{ format: "ipv4" }, { format: "ipv6" }];
  }

  private static ipv4(obj: SchemaNodeData) {
    obj.format = "ipv4";
  }

  private static ipv6(obj: SchemaNodeData) {
    obj.format = "ipv6";
  }

  private static uri(obj: SchemaNodeData) {
    obj.format = "uri";
  }

  private static uriRef(obj: SchemaNodeData) {
    obj.format = "uri-reference";
  }

  private static uuid(obj: SchemaNodeData) {
    obj.format = "uuid";
  }

  private static wellKnownRegex(obj: SchemaNodeData, value: string) {
    switch (value) {
      case "HTTP_HEADER_NAME":
        obj.pattern = "^:?[0-9a-zA-Z!#$%&'*+-.^_|~\x60]+$";
        break;
      case "HTTP_HEADER_VALUE":
        obj.pattern = "^[^\\u0000-\\u0008\\u000A-\\u001F\\u007F]*$";
        break;
    }
  }
}

// https://github.com/bufbuild/protoc-gen-validate/blob/main/tests/harness/cases/repeated.proto
class ProtocGenRepeated {
  public static handle(obj: SchemaNodeData, option: HashMap) {
    for (const [optionKey, value] of Object.entries(option)) {
      switch (optionKey) {
        case "min_items":
          ProtocGenRepeated.minLen(obj, value as number);
          break;
        case "max_items":
          ProtocGenRepeated.maxLen(obj, value as number);
          break;
        case "unique":
          if (value) {
            ProtocGenRepeated.unique(obj);
          }
          break;
        case "items":
          if (obj.items) {
            // avoid null pointer
            protocGenValidate(value as HashMap, obj.items as SchemaNodeData);
          }
          break;
      }
    }
  }

  private static minLen(obj: SchemaNodeData, value: number) {
    obj.minItems = value;
  }

  private static maxLen(obj: SchemaNodeData, value: number) {
    obj.maxItems = value;
  }

  private static unique(obj: SchemaNodeData) {
    obj.uniqueItems = true;
  }
}

class ProtocGenGeneric {
  // x must equal `value` exactly
  public static constValue(
    obj: SchemaNodeData,
    value: string | number | boolean,
  ) {
    obj.const = value;
    delete obj.maximum;
    delete obj.minimum;
  }

  public static inArray(obj: SchemaNodeData, value: number[] | string[]) {
    if (!Array.isArray(value)) {
      throw new Error(`Expect value to be an array: ${value}`);
    }

    obj.oneOf = value.map((val) => {
      const subSchema: SchemaNodeData = {
        const: val,
      };
      return subSchema;
    });
  }

  public static notInArray(obj: SchemaNodeData, value: number[] | string[]) {
    if (!Array.isArray(value)) {
      throw new Error(`Expect value to be an array: ${value}`);
    }

    obj.not = {
      oneOf: value.map((val) => {
        const subSchema: SchemaNodeData = {
          const: val,
        };
        return subSchema;
      }),
    };
  }
}

export function isOptional(field: Field) {
  const parsedOption = findRootOption(field, OPTION_PREFIX);

  if (parsedOption !== null) {
    for (const [dataType, options] of Object.entries(parsedOption)) {
      if (!isRecord(options)) continue;
      if (dataType === "repeated") {
        if (isRecord(options.items)) {
          for (const [key, val] of Object.entries(options.items)) {
            if (key === "ignore_empty" && val) {
              return true;
            }
          }
        }
      } else {
        for (const [key, val] of Object.entries(options)) {
          if (key === "ignore_empty" && val) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

function escapeRegExp(str: string): string {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}
