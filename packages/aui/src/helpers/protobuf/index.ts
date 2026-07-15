/**
 * Pure protobuf → JSON Schema conversion API, consumed by schemaFormat.ts.
 *
 * protobufSchemaParser.ts (the @asyncapi/parser plugin) is deliberately NOT
 * re-exported here: the plugin imports from schemaFormat.ts, so routing it
 * through this barrel would create an import cycle
 * (schemaFormat → protobuf barrel → plugin → schemaFormat).
 */
export { protoToJsonSchema } from "./protoToJsonSchema";
export { validateProtobufStructure } from "./validateProtobufStructure";
