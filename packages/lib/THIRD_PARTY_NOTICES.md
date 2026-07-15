# Third-party notices

## @asyncapi/avro-schema-parser

The Avro → JSON Schema conversion in `src/helpers/avro/avroToJsonSchema.ts`
is ported from
[@asyncapi/avro-schema-parser](https://github.com/asyncapi/avro-schema-parser),
Copyright the AsyncAPI Initiative, licensed under the Apache License 2.0.

Modifications made in this port: synchronous API, removal of the `avsc`-based
validation (replaced by a lightweight structural validator), record-cache
threading through array/map positions, and caching named records as JSON
Schema objects.

## @asyncapi/protobuf-schema-parser

The Protobuf → JSON Schema conversion in `src/helpers/protobuf/`
(`protoToJsonSchema.ts`, `primitiveTypes.ts`, `googleTypes.ts`,
`protovalidate.ts`, `protocGenValidate.ts`, `pathUtils.ts`) is ported from
[@asyncapi/protobuf-schema-parser](https://github.com/asyncapi/protobuf-schema-parser),
Copyright the AsyncAPI Initiative, licensed under the Apache License 2.0.

Modifications made in this port: retyped against aui's `SchemaNodeData`
(dropping the `@asyncapi/parser` type imports), fail-soft plugin `parse()`
(returns an error marker instead of throwing), proto3 syntax detection from
the raw source (protobufjs ≥7.5 no longer exposes `root.options.syntax`),
fixed reversed `Path.resolve(origin, include)` args when reporting unresolved
imports, renamed modules, and strict-TS/lint cleanups (`any` casts narrowed).

The license below applies to both ports.

### Apache License 2.0

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
