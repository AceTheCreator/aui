import { describe, expect, it } from "vitest";
import type { ParseSchemaInput, SchemaParser } from "@asyncapi/parser";
import {
  ProtobufSchemaParser,
  registerProtobufSchemaParser,
} from "../protobufSchemaParser";
import { X_AUI_CONVERSION_ERROR } from "../../schemaFormat";
import type { SchemaParserHost } from "../../schemaParserRegistry";

const parseInput = (data: unknown) =>
  ({ data, path: [], meta: {} }) as unknown as ParseSchemaInput<
    unknown,
    unknown
  >;

describe("ProtobufSchemaParser", () => {
  it("parses .proto source into JSON Schema", async () => {
    const parser = ProtobufSchemaParser();
    const result = (await parser.parse(
      parseInput('syntax = "proto3"; message Foo { string name = 1; }'),
    )) as Record<string, unknown>;

    expect(result.title).toBe("Foo");
    expect(result.type).toBe("object");
  });

  it("returns the fail-soft marker instead of throwing on bad input", async () => {
    const parser = ProtobufSchemaParser();

    const broken = (await parser.parse(
      parseInput("message Broken {"),
    )) as Record<string, unknown>;
    expect(typeof broken[X_AUI_CONVERSION_ERROR]).toBe("string");

    const nonString = (await parser.parse(parseInput({}))) as Record<
      string,
      unknown
    >;
    expect(nonString[X_AUI_CONVERSION_ERROR]).toBe(
      "Protobuf schema must be a string of .proto source",
    );
  });

  it("reports validation problems with the input path", async () => {
    const parser = ProtobufSchemaParser();
    const results = await parser.validate({
      data: "message Broken {",
      path: ["components", "messages"],
    } as never);

    expect(results).toHaveLength(1);
    expect(results?.[0].path).toEqual(["components", "messages"]);
  });
});

describe("registerProtobufSchemaParser", () => {
  it("registers exact MIME types and falls back for unlisted versions", () => {
    const registered = new Map<string, SchemaParser>();
    const host: SchemaParserHost = {
      registerSchemaParser(schemaParser: SchemaParser) {
        for (const mime of schemaParser.getMimeTypes()) {
          registered.set(mime, schemaParser);
        }
      },
      parserRegistry: {
        get: (key: string) => registered.get(key),
      },
    };

    registerProtobufSchemaParser(host);

    expect(
      host.parserRegistry.get("application/vnd.google.protobuf;version=3"),
    ).toBeDefined();
    // Unlisted version resolves through the fallback patch.
    expect(
      host.parserRegistry.get("application/vnd.google.protobuf;version=4"),
    ).toBeDefined();
    expect(host.parserRegistry.get("application/raml+yaml")).toBeUndefined();
  });
});
