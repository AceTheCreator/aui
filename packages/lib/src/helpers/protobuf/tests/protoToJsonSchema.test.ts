import { describe, expect, it } from "vitest";
import { protoToJsonSchema } from "../protoToJsonSchema";
import { validateProtobufStructure } from "../validateProtobufStructure";
import type { SchemaNodeData } from "../../../types/schema";

/** Proto sources adapted from @asyncapi/protobuf-schema-parser's test suite. */

const simpleProto3 = `
syntax = "proto3";

message Point {
  int32 x = 1;
  int32 y = 2;
  optional string label = 3;
}

message Line {
  Point start = 1;
  Point end = 2;
  optional string label = 3;
}
`;

const simpleProto2 = `
syntax = "proto2";

message Point {
  required int32 x = 1;
  required int32 y = 2;
  optional string label = 3;
}
`;

describe("protoToJsonSchema", () => {
  it("converts a simple proto3 schema, picking the unreferenced root message", () => {
    const schema = protoToJsonSchema(simpleProto3);

    // Point is referenced by Line, so Line is the root.
    expect(schema.title).toBe("Line");
    expect(schema.type).toBe("object");
    expect(Object.keys(schema.properties ?? {})).toEqual([
      "start",
      "end",
      "label",
    ]);
    // proto3: non-`optional` fields are required.
    expect(schema.required).toEqual(["start", "end"]);

    const start = schema.properties?.start;
    expect(start?.title).toBe("Point");
    expect(start?.["x-type"]).toBe("Point");
    expect(start?.properties?.x).toMatchObject({
      type: "integer",
      format: "int32",
      minimum: -0x80000000,
      maximum: 0x7fffffff,
      "x-primitive": "int32",
    });
  });

  it("honors proto2 required/optional keywords", () => {
    const schema = protoToJsonSchema(simpleProto2);

    expect(schema.title).toBe("Point");
    expect(schema.required).toEqual(["x", "y"]);
    expect(schema.properties?.label?.["x-primitive"]).toBe("string");
  });

  it("drops numeric range limits with @Option primitiveTypesWithLimits false", () => {
    const schema = protoToJsonSchema(`
      syntax = "proto3";
      // @Option primitiveTypesWithLimits false
      message Point {
        int32 x = 1;
      }
    `);

    expect(schema.properties?.x?.type).toBe("integer");
    expect(schema.properties?.x?.minimum).toBeUndefined();
    expect(schema.properties?.x?.maximum).toBeUndefined();
  });

  it("converts enums with x-enum-mapping and comments into descriptions", () => {
    const schema = protoToJsonSchema(`
      // Single-line comment
      message Line {
        // field comment A
        required Point start = 1;
        optional string label = 2;
        // field comment B
        required LineSize line_size = 3;
      }

      message Point {
        required int32 x = 1;
      }

      enum LineSize {
        TST_A = 1;
        TST_B = 2;
        TST_C = 3;
      }
    `);

    expect(schema.title).toBe("Line");
    expect(schema.description).toBe("Single-line comment");
    expect(schema.properties?.start?.description).toBe("field comment A");

    const lineSize = schema.properties?.line_size;
    expect(lineSize).toMatchObject({
      title: "LineSize",
      type: "string",
      enum: ["TST_A", "TST_B", "TST_C"],
      "x-enum-mapping": { TST_A: 1, TST_B: 2, TST_C: 3 },
      "x-type": "LineSize",
      // The enum field's description comes from the field comment (matching
      // upstream), not the enum declaration's own comment.
      description: "field comment B",
    });
  });

  it("converts oneof groups to oneOf with x-oneof-item markers", () => {
    const schema = protoToJsonSchema(`
      syntax = "proto3";
      message Event {
        string id = 1;
        oneof body {
          string text = 2;
          int32 code = 3;
        }
      }
    `);

    const body = schema.properties?.body;
    const variants = body?.oneOf as SchemaNodeData[];
    expect(variants).toHaveLength(2);
    expect(variants[0]["x-oneof-item"]).toBe("text");
    expect(variants[0].type).toBe("string");
    expect(variants[1]["x-oneof-item"]).toBe("code");
    expect(variants[1].type).toBe("integer");
    // oneof members are not part of `required`.
    expect(schema.required).toEqual(["id"]);
  });

  it("converts repeated fields to arrays with @MinItems/@MaxItems", () => {
    const schema = protoToJsonSchema(`
      syntax = "proto3";
      message Basket {
        /*
         * Tags.
         * @MinItems 1
         * @MaxItems 10
         */
        repeated string tags = 1;
      }
    `);

    const tags = schema.properties?.tags;
    expect(tags?.type).toBe("array");
    expect(tags?.minItems).toBe(1);
    expect(tags?.maxItems).toBe(10);
    expect(tags?.description).toBe("Tags.");
    expect((tags?.items as SchemaNodeData).type).toBe("string");
  });

  it("applies comment annotations: @Example, @Default, and validators", () => {
    const schema = protoToJsonSchema(`
      syntax = "proto3";
      message RestrictedEntity {
        /*
         * Identifier code.
         * @Required
         * @Pattern ^[A-Z]{2}\\d+$
         * @MinLength 3
         * @MaxLength 10
         * @Example DE1234
         * @Default DE0000
         */
        optional string code = 1;

        /*
         * Quantity of items.
         * @Minimum 1
         * @Maximum 100
         * @MultipleOf 5
         */
        int32 quantity = 2;

        /*
         * Ratio strictly between 0 and 1.
         * @ExclusiveMinimum 0
         * @ExclusiveMaximum 1
         */
        double ratio = 3;

        /*
         * Angle.
         * @Min 0
         * @Max 360
         */
        int32 angle = 4;
      }
    `);

    const code = schema.properties?.code;
    expect(code?.description).toBe("Identifier code.");
    expect(code?.pattern).toBe("^[A-Z]{2}\\d+$");
    expect(code?.minLength).toBe(3);
    expect(code?.maxLength).toBe(10);
    expect(code?.examples).toEqual(["DE1234"]);
    expect(code?.default).toBe("DE0000");
    // @Required overrides the `optional` keyword.
    expect(schema.required).toContain("code");

    const quantity = schema.properties?.quantity;
    expect(quantity?.minimum).toBe(1);
    expect(quantity?.maximum).toBe(100);
    expect(quantity?.multipleOf).toBe(5);

    const ratio = schema.properties?.ratio;
    expect(ratio?.exclusiveMinimum).toBe(0);
    expect(ratio?.exclusiveMaximum).toBe(1);

    const angle = schema.properties?.angle;
    expect(angle?.minimum).toBe(0);
    expect(angle?.maximum).toBe(360);
  });

  it("resolves bundled google/protobuf and google/type imports", () => {
    const schema = protoToJsonSchema(`
      syntax = "proto3";
      import "google/protobuf/timestamp.proto";
      import "google/type/date.proto";

      message Order {
        google.protobuf.Timestamp created = 1;
        google.type.Date delivery = 2;
      }
    `);

    const created = schema.properties?.created;
    expect(created?.["x-type"]).toBe("google.protobuf.Timestamp");
    expect(Object.keys(created?.properties ?? {})).toEqual(["seconds", "nanos"]);

    const delivery = schema.properties?.delivery;
    expect(delivery?.["x-type"]).toBe("google.type.Date");
    expect(Object.keys(delivery?.properties ?? {})).toEqual([
      "year",
      "month",
      "day",
    ]);
  });

  it("translates protovalidate (buf.validate) field options", () => {
    const schema = protoToJsonSchema(`
      syntax = "proto3";
      import "buf/validate/validate.proto";

      message Person {
        uint64 id = 1 [(buf.validate.field).uint64.gt = 999];
        string email = 2 [(buf.validate.field).string.email = true];
        string name = 3 [(buf.validate.field).string = {
          pattern: "^[A-Za-z]+( [A-Za-z]+)*$",
          max_bytes: 256,
        }];
      }
    `);

    const id = schema.properties?.id;
    expect(id?.exclusiveMinimum).toBe(999);

    expect(schema.properties?.email?.format).toBe("email");

    const name = schema.properties?.name;
    expect(name?.pattern).toBe("^[A-Za-z]+( [A-Za-z]+)*$");
    expect(name?.maxLength).toBe(256);
  });

  it("translates protoc-gen-validate (validate.rules) field options", () => {
    const schema = protoToJsonSchema(`
      syntax = "proto3";
      import "validate/validate.proto";

      message Person {
        uint64 id = 1 [(validate.rules).uint64.gt = 999];
        string email = 2 [(validate.rules).string.email = true];
        repeated string tags = 3 [(validate.rules).repeated = {min_items: 1, unique: true}];
      }
    `);

    expect(schema.properties?.id?.exclusiveMinimum).toBe(999);
    expect(schema.properties?.email?.format).toBe("email");

    const tags = schema.properties?.tags;
    expect(tags?.minItems).toBe(1);
    expect(tags?.uniqueItems).toBe(true);
  });

  it("stops on recursive message definitions instead of looping", () => {
    const schema = protoToJsonSchema(`
      syntax = "proto3";
      package Example;

      message A {
        string something = 1;
        repeated A recursive = 2;
      }
    `);

    expect(schema.title).toBe("A");
    const first = schema.properties?.recursive?.items as SchemaNodeData;
    expect(first.title).toBe("A");
    const second = first.properties?.recursive?.items as SchemaNodeData;
    // Recursion guard: the second repetition renders without properties.
    expect(second.title).toBe("A");
    expect(second.properties).toEqual({});
  });

  it("resolves multi-root ambiguity via the @RootNode annotation", () => {
    const twoRoots = (annotation: string) => `
      syntax = "proto3";

      ${annotation}
      message Point {
        int32 x = 1;
      }

      message Line {
        int32 y = 1;
      }
    `;

    expect(() => protoToJsonSchema(twoRoots(""))).toThrow(
      /Found more than one root proto messages: Point, Line/,
    );

    const schema = protoToJsonSchema(twoRoots("// @RootNode"));
    expect(schema.title).toBe("Point");
  });

  it("throws on sources without any message", () => {
    expect(() => protoToJsonSchema('syntax = "proto3";')).toThrow(
      /Not found a root proto messages/,
    );
  });

  it("throws on imports that are not bundled", () => {
    expect(() =>
      protoToJsonSchema(`
        syntax = "proto3";
        import "my/company/types.proto";
        message Foo { int32 x = 1; }
      `),
    ).toThrow(
      /Imports are currently not implemented\. Can not load: my\/company\/types\.proto/,
    );
  });

  it("compiles map fields as their value type (documented upstream behavior)", () => {
    const schema = protoToJsonSchema(`
      syntax = "proto3";
      message Config {
        map<string, int32> values = 1;
      }
    `);

    // protobufjs MapFields expose the value type as `field.type`; upstream
    // (and this port) renders that rather than an object with
    // additionalProperties.
    expect(schema.properties?.values?.["x-primitive"]).toBe("int32");
  });
});

describe("validateProtobufStructure", () => {
  it("returns no problems for compilable sources", () => {
    expect(validateProtobufStructure(simpleProto3)).toEqual([]);
  });

  it("reports compile errors as messages", () => {
    const problems = validateProtobufStructure("message Broken {");
    expect(problems).toHaveLength(1);
    expect(problems[0]).toBeTruthy();
  });

  it("rejects non-string input", () => {
    expect(validateProtobufStructure({ type: "record" })).toEqual([
      "Protobuf schema must be a string of .proto source",
    ]);
  });
});
