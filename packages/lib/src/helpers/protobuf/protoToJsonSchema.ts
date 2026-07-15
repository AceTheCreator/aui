/**
 * Protobuf (.proto source text) → JSON Schema conversion.
 *
 * Ported from @asyncapi/protobuf-schema-parser
 * (https://github.com/asyncapi/protobuf-schema-parser), Copyright the
 * AsyncAPI Initiative, licensed under Apache-2.0 — see THIRD_PARTY_NOTICES.md.
 *
 * The heavy lifting — parsing `.proto` text into reflection objects — is done
 * by protobufjs (`protobuf.parse`, full build; comments preserved via
 * `alternateCommentMode`). This module walks the parsed types and emits JSON
 * Schema: messages → objects, enums → string enums (+ `x-enum-mapping`),
 * `repeated` → arrays, `oneof` → `oneOf` (+ `x-oneof-item`), scalars via
 * primitiveTypes.ts (+ `x-primitive`). Comment annotations (`@Example`,
 * `@Default`, `@Min`/`@Max`, `@Pattern`, `@Required`, `@RootNode`, `@Option`)
 * and protovalidate / protoc-gen-validate field options become JSON Schema
 * constraints.
 *
 * Imports in the proto source resolve only against bundled definitions:
 * `google/protobuf/*` (protobufjs's `protobuf.common`), `google/type/*` and
 * the validate option protos (googleTypes.ts). Anything else throws —
 * callers (resolveSchemaInput / the parser plugin) fail soft.
 *
 * Divergences from upstream: renamed from proto2jsonSchema, typed against
 * the lib's SchemaNodeData instead of @asyncapi/parser's spec types,
 * `any`-casts replaced with narrow typed casts, and corrected reversed
 * `Path.resolve(origin, include)` args when reporting unresolved imports.
 */
import * as protobuf from "protobufjs";
import type { SchemaNodeData } from "../../types/schema";
import { googleProtoTypes } from "./googleTypes";
import { Path } from "./pathUtils";
import { PrimitiveTypes } from "./primitiveTypes";
import { visit as protocGenValidateVisit } from "./protocGenValidate";
import {
  isOptional as protoValidateIsOptional,
  visit as protoValidateVisit,
} from "./protovalidate";

const ROOT_FILENAME = "root";
const COMMENT_ROOT_NODE = "@RootNode";
const COMMENT_OPTION = "@Option";
const COMMENT_EXAMPLE = "@Example";
const COMMENT_DEFAULT = "@Default";

type ProtoAsJson = Record<string, unknown>;
type ProtoItems = { [k: string]: protobuf.ReflectionObject };

/** protobufjs's bundled google/protobuf/* definitions, indexable by filename.
 * `protobuf.common` is typed as a function, but it also carries the bundled
 * descriptors as properties (see protobufjs src/common.js). */
const commonProtoTypes = protobuf.common as unknown as Record<
  string,
  ProtoAsJson | undefined
>;

class Proto2JsonSchema {
  private root = new protobuf.Root();
  private proto3: boolean;
  private protoParseOptions = {
    keepCase: true,
    alternateCommentMode: true,
  };
  private mapperOptions: { [key: string]: string | boolean } = {
    primitiveTypesWithLimits: true,
  };

  constructor(rawSchema: string) {
    // Upstream read `root.options.syntax`, which protobufjs stopped exposing
    // in 7.5 (editions support). Detecting the declaration in the source is
    // equivalent for the single root file this converter accepts, and doesn't
    // depend on protobufjs internals.
    this.proto3 = /syntax\s*=\s*['"]proto3['"]/.test(rawSchema);

    this.parseOptionsAnnotation(rawSchema);

    this.process(ROOT_FILENAME, rawSchema);
  }

  private parseOptionsAnnotation(rawSchema: string) {
    const regex =
      /(\/\/|\*)\s*@Option\s+(?<key>\w{1,50})\s+(?<value>\S[^\r\n]{0,199})/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(rawSchema)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      if (m.groups === undefined) {
        break;
      }

      if (m.groups.value === "true") {
        this.mapperOptions[m.groups.key] = true;
      } else if (m.groups.value === "false") {
        this.mapperOptions[m.groups.key] = false;
      } else {
        this.mapperOptions[m.groups.key] = m.groups.value;
      }
    }
  }

  private process(filename: string, source: string | ProtoAsJson) {
    if (typeof source !== "string") {
      this.root.setOptions(source.options as Record<string, unknown>);
      this.root.addJSON(source.nested as Parameters<protobuf.Root["addJSON"]>[0]);
    } else {
      // protobufjs's parse() reads a `filename` property off the function
      // itself to tag the parsed reflection objects (and resets it after each
      // call); resolveByFilename() below depends on those tags.
      (protobuf.parse as unknown as { filename?: string }).filename = filename;
      const parsed = protobuf.parse(source, this.root, this.protoParseOptions);
      let i = 0;
      if (parsed.imports) {
        for (; i < parsed.imports.length; ++i) {
          this.fetch(parsed.imports[i], filename, false);
        }
      }

      if (parsed.weakImports) {
        for (i = 0; i < parsed.weakImports.length; ++i) {
          this.fetch(parsed.weakImports[i], filename, true);
        }
      }
    }
  }

  // Bundled definition existence checking
  private getBundledFileName(filename: string): string | null {
    if (
      filename === "validate/validate.proto" ||
      filename === "/validate/validate.proto"
    ) {
      return "validate/validate.proto";
    }
    if (
      filename === "buf/validate/validate.proto" ||
      filename === "/buf/validate/validate.proto"
    ) {
      return "buf/validate/validate.proto";
    }

    let idx = filename.lastIndexOf("google/protobuf/");
    if (idx > -1) {
      const shortName = filename.substring(idx);
      if (shortName in commonProtoTypes) {
        return shortName;
      }
    }

    idx = filename.lastIndexOf("google/type/");
    if (idx > -1) {
      const shortName = filename.substring(idx);
      if (shortName in googleProtoTypes) {
        return shortName;
      }
    }

    return null;
  }

  private fetch(filename: string, parentFilename: string, weak: boolean) {
    const bundledFilename = this.getBundledFileName(filename) || filename;

    // Skip if already loaded / attempted
    if (this.root.files.indexOf(bundledFilename) > -1) {
      return;
    }
    this.root.files.push(bundledFilename);

    // Shortcut bundled definitions
    const commonDefinition = commonProtoTypes[bundledFilename];
    if (commonDefinition !== undefined) {
      this.process(bundledFilename, commonDefinition);
      return;
    }

    if (bundledFilename in googleProtoTypes) {
      this.process(bundledFilename, googleProtoTypes[bundledFilename]);
      return;
    }

    // Resolve the import against the parent file's directory (origin, include).
    const resolvedFilename = Path.resolve(parentFilename, bundledFilename);

    if (!weak) {
      throw new Error(
        `Imports are currently not implemented. Can not load: ${resolvedFilename} defined in as ${filename} in ${parentFilename}`,
      );
    }
  }

  public compile(): SchemaNodeData {
    this.root.resolveAll();

    const rootItemCandidates = this.resolveByFilename(
      ROOT_FILENAME,
      this.root.nested as ProtoItems,
    );
    const rootItem = this.findRootItem(rootItemCandidates);

    return this.compileMessage(rootItem, []);
  }

  private resolveByFilename(filename: string, items: ProtoItems) {
    const hits: protobuf.Type[] = [];
    for (const itemName in items) {
      const item = items[itemName];
      if (item.filename === filename && item instanceof protobuf.Type) {
        hits.push(item);
      }

      const nested = (item as protobuf.Namespace).nested;
      if (nested) {
        hits.push(...this.resolveByFilename(filename, nested));
      }
    }

    return hits;
  }

  private findRootItem(candidates: protobuf.Type[]): protobuf.Type {
    const usedTypes = new Map<string, Set<string>>();
    for (const candidate of candidates) {
      for (const fieldName in candidate.fields) {
        if (!usedTypes.has(candidate.fields[fieldName].type)) {
          usedTypes.set(
            candidate.fields[fieldName].type,
            new Set<string>([candidate.name]),
          );
        } else {
          usedTypes.get(candidate.fields[fieldName].type)?.add(candidate.name);
        }
      }
    }

    const rootTypes: protobuf.Type[] = [];
    for (const candidate of candidates) {
      const isUsedBy = usedTypes.get(candidate.name);
      if (isUsedBy && (isUsedBy?.size > 1 || !isUsedBy.has(candidate.name))) {
        // This type was used in another type. And not only by itself.
        continue;
      }

      rootTypes.push(candidate);
    }

    if (rootTypes.length < 1) {
      throw new Error("Not found a root proto messages");
    }

    if (rootTypes.length === 1) {
      return rootTypes[0];
    }

    for (const rootType of rootTypes) {
      if (rootType.comment && rootType.comment.indexOf(COMMENT_ROOT_NODE) !== -1) {
        return rootType;
      }
    }

    const allRootTypes = rootTypes.map((rootType) => rootType.name).join(", ");

    throw new Error(`Found more than one root proto messages: ${allRootTypes}`);
  }

  private isProto3() {
    return this.proto3;
  }

  private isProto3Required(field: protobuf.Field) {
    if (protoValidateIsOptional(field)) {
      return false;
    }
    return field.options?.proto3_optional !== true && this.isProto3();
  }

  private hasRequiredAnnotation(comment: string | null): boolean {
    return comment !== null && /@Required\b/i.test(comment);
  }

  /**
   * Compiles a protobuf message to JSON schema
   */
  private compileMessage(item: protobuf.Type, stack: string[]): SchemaNodeData {
    const properties: { [key: string]: SchemaNodeData } = {};

    const obj: SchemaNodeData = {
      title: item.name,
      type: "object",
      required: [],
      properties,
    };

    const desc = this.extractDescription(item.comment);
    if (desc !== null && desc.length > 0) {
      obj.description = desc;
    }

    const timesSeenThisClassInStack = stack.filter((x) => x === item.name).length;
    if (timesSeenThisClassInStack >= 2) {
      // Detected a recursion.
      return obj;
    }

    stack.push(item.name);

    for (const fieldName in item.fields) {
      const field = item.fields[fieldName];

      if (field.partOf && field.partOf.oneof.length > 1) {
        // Filter only real oneof. Don't do for false positives optionals (oneof starting with _ and contain only one entry)
        continue;
      }

      if (
        field.required ||
        this.isProto3Required(field) ||
        this.hasRequiredAnnotation(field.comment)
      ) {
        obj.required?.push(fieldName);
      }

      if (field.repeated) {
        properties[field.name] = {
          type: "array",
          items: this.compileField(field, item, stack.slice()),
        };

        const desc = this.extractDescription(field.comment);
        if (desc !== null && desc.length > 0) {
          properties[field.name].description = desc;
        }

        if (field.comment) {
          const minItemsPattern = /@MinItems\s(\d+)/i;
          const maxItemsPattern = /@MaxItems\s(\d+)/i;
          let m: RegExpExecArray | null;
          if ((m = minItemsPattern.exec(field.comment)) !== null) {
            properties[field.name].minItems = Number.parseInt(m[1], 10);
          }
          if ((m = maxItemsPattern.exec(field.comment)) !== null) {
            properties[field.name].maxItems = Number.parseInt(m[1], 10);
          }
        }

        protocGenValidateVisit(properties[field.name], field);
        protoValidateVisit(properties[field.name], field);
      } else {
        properties[field.name] = this.compileField(field, item, stack.slice());
      }
    }

    for (const oneOfItem of item.oneofsArray) {
      if (oneOfItem.fieldsArray.length < 2) {
        // Filter optionals (oneof starting with _ and contain only one entry)
        continue;
      }

      if (!properties[oneOfItem.name]) {
        properties[oneOfItem.name] = {
          oneOf: [],
        };
      }
      const oneOf = properties[oneOfItem.name].oneOf as SchemaNodeData[];

      for (const fieldName of oneOfItem.oneof) {
        const field = this.compileField(item.fields[fieldName], item, stack.slice());
        field["x-oneof-item"] = fieldName;

        oneOf.push(field);
      }
    }

    if ((obj.required?.length ?? 0) < 1) {
      delete obj.required;
    }

    return obj;
  }

  /**
   * Compiles a protobuf enum to JSON schema
   */
  private compileEnum(field: protobuf.Enum): SchemaNodeData {
    const enumMapping: { [key: string]: number } = {};
    for (const enumKey of Object.keys(field.values)) {
      enumMapping[enumKey] = field.values[enumKey];
    }

    const obj: SchemaNodeData = {
      title: field.name,
      type: "string",
      enum: Object.keys(field.values),
      "x-enum-mapping": enumMapping,
    };

    this.addDefaultFromCommentAnnotations(obj, field.comment);

    return obj;
  }

  private compileField(
    field: protobuf.Field,
    parentItem: protobuf.Type,
    stack: string[],
  ): SchemaNodeData {
    let obj: SchemaNodeData = {};

    if (PrimitiveTypes.PRIMITIVE_TYPES_WITH_LIMITS[field.type.toLowerCase()]) {
      obj = this.mapperOptions.primitiveTypesWithLimits
        ? Object.assign(
            obj,
            PrimitiveTypes.PRIMITIVE_TYPES_WITH_LIMITS[field.type.toLowerCase()],
          )
        : Object.assign(
            obj,
            PrimitiveTypes.PRIMITIVE_TYPES_MINIMAL[field.type.toLowerCase()],
          );
      obj["x-primitive"] = field.type;
    } else {
      const item = parentItem.lookupTypeOrEnum(field.type);
      if (!item) {
        throw new Error(
          `Unable to resolve type "${field.type}" @ ${parentItem.fullName}`,
        );
      }

      if (item instanceof protobuf.Enum) {
        obj = Object.assign(obj, this.compileEnum(item));
      } else {
        obj = Object.assign(obj, this.compileMessage(item, stack));
      }

      if (field.type) {
        obj["x-type"] = field.type;
      }
    }

    this.addValidatorFromCommentAnnotations(obj, field.comment);
    this.addDefaultFromCommentAnnotations(obj, field.comment);
    if (!field.repeated) {
      protocGenValidateVisit(obj, field);
      protoValidateVisit(obj, field);
    }

    const desc = this.extractDescription(field.comment);
    if (desc !== null && desc.length > 0) {
      if (obj.description) {
        obj.description = `${desc}\n${obj.description}`.trim();
      } else {
        obj.description = desc;
      }
    }

    const examples = this.extractExamples(field.comment);
    if (examples !== null) {
      obj.examples = examples;
    }

    return obj;
  }

  private extractDescription(comment: string | null): string | null {
    if (!comment || comment?.length < 1) {
      return null;
    }

    comment = comment
      .replace(new RegExp(`\\s{0,15}${COMMENT_EXAMPLE}\\s{0,15}(.+)`, "ig"), "")
      .replace(new RegExp(`\\s{0,15}${COMMENT_DEFAULT}\\s{0,15}(.+)`, "ig"), "")
      .replace(new RegExp(`\\s{0,15}${COMMENT_OPTION}\\s{0,15}(.+)`, "ig"), "")
      .replace(new RegExp(`\\s{0,15}${COMMENT_ROOT_NODE}`, "ig"), "")
      .replace(/\s{0,15}@Required/gi, "")
      .replace(/\s{0,15}@Pattern\s{0,15}[^\r\n]{1,200}/gi, "")
      .replace(
        /\s{0,15}@(Min|Max|Minimum|Maximum|ExclusiveMinimum|ExclusiveMaximum|MultipleOf|MaxLength|MinLength|MaxItems|MinItems)\s{0,15}[\d.]{1,20}/gi,
        "",
      )
      .trim();

    if (comment.length < 1) {
      return null;
    }

    return comment;
  }

  private extractExamples(
    comment: string | null,
  ): (string | ProtoAsJson)[] | null {
    if (!comment) {
      return null;
    }

    const examples: (string | ProtoAsJson)[] = [];

    let m: RegExpExecArray | null;
    const examplePattern = new RegExp(`\\s*${COMMENT_EXAMPLE}\\s(.+)$`, "i");
    for (const line of comment.split("\n")) {
      if ((m = examplePattern.exec(line)) !== null) {
        examples.push(tryParseToObject(m[1].trim()));
      }
    }

    if (examples.length < 1) {
      return null;
    }

    return examples;
  }

  private addValidatorFromCommentAnnotations(
    obj: SchemaNodeData,
    comment: string | null,
  ) {
    if (comment === null || comment?.length < 1) {
      return;
    }

    const patternMin = /@Min\s([+-]?\d+(\.\d+)?)/i;
    const patternMax = /@Max\s([+-]?\d+(\.\d+)?)/i;
    const patternPattern = /@Pattern\s([^\n]+)/i;

    const patterns = new Map<string, RegExp>([
      ["minimum", /@Minimum\s([+-]?\d+(\.\d+)?)/i],
      ["maximum", /@Maximum\s([+-]?\d+(\.\d+)?)/i],
      ["exclusiveMinimum", /@ExclusiveMinimum\s([+-]?\d+(\.\d+)?)/i],
      ["exclusiveMaximum", /@ExclusiveMaximum\s([+-]?\d+(\.\d+)?)/i],
      ["multipleOf", /@MultipleOf\s(\d+(\.\d+)?)/i],
      ["maxLength", /@MaxLength\s(\d+)/i],
      ["minLength", /@MinLength\s(\d+)/i],
    ]);

    let m: RegExpExecArray | null;

    if ((m = patternMin.exec(comment)) !== null) {
      obj.minimum = parseFloat(m[1]);
    }

    if ((m = patternMax.exec(comment)) !== null) {
      obj.maximum = parseFloat(m[1]);
    }

    if ((m = patternPattern.exec(comment)) !== null) {
      obj.pattern = m[1].trim();
    }

    for (const e of patterns.entries()) {
      if ((m = e[1].exec(comment)) !== null) {
        obj[e[0]] = parseFloat(m[1]);
      }
    }
  }

  private addDefaultFromCommentAnnotations(
    obj: SchemaNodeData,
    comment: string | null,
  ) {
    if (comment === null || comment?.length < 1) {
      return;
    }
    const defaultPattern = new RegExp(`\\s*${COMMENT_DEFAULT}\\s(.+)$`, "i");
    let m: RegExpExecArray | null;

    if ((m = defaultPattern.exec(comment)) !== null) {
      obj.default = tryParseToObject(m[1]);
    }
  }
}

/**
 * Converts `.proto` source text into a JSON-Schema-shaped object. Throws on
 * unparsable source, unresolvable (non-bundled) imports, or ambiguous root
 * messages — callers are expected to fail soft.
 */
export function protoToJsonSchema(rawSchema: string): SchemaNodeData {
  const compiler = new Proto2JsonSchema(rawSchema);
  return compiler.compile();
}

function tryParseToObject(value: string): string | ProtoAsJson {
  if (value.charAt(0) === "{") {
    try {
      const json = JSON.parse(value);
      if (json) {
        return json;
      }
    } catch {
      // Ignored error, seems not to be a valid json. Maybe just an example starting with an "{" but is not a json.
    }
  }

  return value;
}
