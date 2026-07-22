import { hasRef } from "../utils/hasRef";

/**
 * Upfront $ref resolution for the without-parser entry point.
 *
 * Walks the document once and returns a NEW tree (the input is never mutated)
 * where every internal `{ $ref: "#/..." }` node is replaced by its resolved
 * target. Renderers and search can then treat the document as a plain
 * walkable object instead of chasing refs at render time.
 *
 * Two deliberate behaviors:
 *
 * - Refs that would create a cycle (a ref whose target is currently being
 *   resolved higher up the same chain) are left as `$ref` nodes. Inlining
 *   them would build real object cycles, which break JSON.stringify (the
 *   JSON tab, example generation) — the schema tree renders these leftovers
 *   lazily via `deref` and marks them circular, exactly as before.
 *
 * - Inlined targets are stamped with `x-parser-schema-id` (the ref's last
 *   path segment) when they don't already carry one. This mirrors what
 *   @asyncapi/parser leaves behind on the with-parser path and is what the
 *   schema tree reads to show referenced-schema name badges. The JSON tab
 *   already strips `x-parser-*` markers before display.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Extracts the schema name from a JSON Pointer, e.g. "#/components/schemas/sentAt" → "sentAt". */
const refNameFromPath = (ref: string) =>
  ref.replace(/^#\//, "").split("/").pop() ?? ref;

/**
 * Cheap read-only scan for any `$ref` at all — no copies, early exit on the
 * first hit. Lets resolveDocument return already-resolved documents (parser
 * output, ref-free specs) untouched, identity included, instead of paying for
 * a full deep copy. The visited set makes it terminate on object cycles.
 */
const containsRefs = (value: unknown, visited = new Set<object>()): boolean => {
  if (typeof value !== "object" || value === null) return false;
  if (visited.has(value)) return false;
  visited.add(value);
  if (hasRef(value)) return true;
  const children = Array.isArray(value) ? value : Object.values(value);
  return children.some((child) => containsRefs(child, visited));
};

/** Walks a JSON Pointer ("#/components/…") against the original document. */
const lookupPointer = (root: unknown, refPath: string): unknown => {
  if (!refPath.startsWith("#")) return undefined; // external refs are out of scope for now
  const parts = refPath.replace(/^#\//, "").split("/").filter(Boolean);
  let current: unknown = root;
  for (const part of parts) {
    if (!isRecord(current) && !Array.isArray(current)) return undefined;
    const decoded = part.replace(/~1/g, "/").replace(/~0/g, "~");
    current = (current as Record<string, unknown>)[decoded];
    if (current == null) return undefined;
  }
  return current;
};

export function resolveDocument<T>(doc: T): T {
  // Already-resolved input (parser output, ref-free specs) passes through
  // with its identity intact — this is also what makes a caller-side
  // "already resolved" promise unnecessary: verifying costs a scan, not a copy.
  if (!containsRefs(doc)) return doc;

  // Shared targets resolve to the same copy (keeps memory flat and lets two
  // reference sites stay identical objects). Also makes the walk terminate on
  // input that already contains object cycles (e.g. parser output).
  const copies = new Map<object, unknown>();
  // Source objects on the current walk path. A $ref whose target is one of
  // these would create a brand-new object cycle if inlined — whether the ref
  // points at an ancestor reached by plain traversal (a schema referencing
  // itself from its own definition) or through a chain of refs — so it stays
  // a `$ref` node.
  const active = new Set<object>();

  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      const existing = copies.get(value);
      if (existing !== undefined) return existing;
      const copy: unknown[] = [];
      copies.set(value, copy);
      active.add(value);
      try {
        for (const item of value) copy.push(walk(item));
      } finally {
        active.delete(value);
      }
      return copy;
    }

    if (hasRef(value)) {
      const target = lookupPointer(doc, value.$ref);
      const targetIsContainer = isRecord(target) || Array.isArray(target);
      if (targetIsContainer && !active.has(target)) {
        const resolved = walk(target);
        if (isRecord(resolved) && resolved["x-parser-schema-id"] === undefined) {
          resolved["x-parser-schema-id"] = refNameFromPath(value.$ref);
        }
        return resolved;
      }
      if (target !== undefined && !targetIsContainer) return target; // scalar
      // Circular (target is on the active path) or unresolvable: fall through
      // and keep the `$ref` node as-is (copied).
    }

    if (isRecord(value)) {
      const existing = copies.get(value);
      if (existing !== undefined) return existing;
      const copy: Record<string, unknown> = {};
      copies.set(value, copy);
      active.add(value);
      try {
        for (const [key, val] of Object.entries(value)) {
          copy[key] = walk(val);
        }
      } finally {
        active.delete(value);
      }
      return copy;
    }

    return value;
  };

  return walk(doc) as T;
}
