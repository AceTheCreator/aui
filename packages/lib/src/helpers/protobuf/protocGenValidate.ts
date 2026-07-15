/**
 * Translates protoc-gen-validate field options — `(validate.rules)`, see
 * https://github.com/bufbuild/protoc-gen-validate — into JSON Schema
 * constraints. The rule vocabulary matches protovalidate's, so this module
 * only locates the option root and delegates to protovalidate.ts.
 *
 * Ported from @asyncapi/protobuf-schema-parser
 * (https://github.com/asyncapi/protobuf-schema-parser), Copyright the
 * AsyncAPI Initiative, licensed under Apache-2.0 — see THIRD_PARTY_NOTICES.md.
 * Divergence from upstream: typed against the lib's SchemaNodeData; the
 * option-root lookup is shared with protovalidate.ts instead of duplicated.
 */
import type { Field } from "protobufjs";
import type { SchemaNodeData } from "../../types/schema";
import { findRootOption, protocGenValidate } from "./protovalidate";

const OPTION_PREFIX = "(validate.rules)";

export function visit(obj: SchemaNodeData, field: Field) {
  const parsedOption = findRootOption(field, OPTION_PREFIX);

  if (parsedOption !== null) {
    protocGenValidate(parsedOption, obj);
  }
}
