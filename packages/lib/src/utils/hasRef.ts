export const hasRef = (value: unknown): value is { $ref: string } => {
  return (
    typeof value === "object" &&
    value !== null &&
    "$ref" in value &&
    typeof value.$ref === "string"
  );
};

export const resolveRefs = (value: unknown, deref: (ref: string) => unknown, visited = new Set<object>()): unknown => {
  while (hasRef(value)) {
    const resolved = deref(value.$ref);
    const record = value as Record<string, unknown>;
    Object.keys(record).forEach((k) => delete record[k]);
    Object.assign(record, resolved);
  }

  if (Array.isArray(value)) {
    visited.add(value);
    value.forEach((item, i) => {
      if (!visited.has(item)) {
        value[i] = resolveRefs(item, deref, visited);
      }
    });
  } else if (typeof value === "object" && value !== null) {
    visited.add(value);
    const record = value as Record<string, unknown>;
    for (const [key, val] of Object.entries(record)) {
      if (typeof val === "object" && val !== null && visited.has(val)) continue;
      record[key] = resolveRefs(val, deref, visited);
    }
  }

  return value;
};
