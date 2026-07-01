export const hasRef = (value: any): value is { $ref: string } => {
  return (
    typeof value === "object" &&
    value !== null &&
    "$ref" in value &&
    typeof value.$ref === "string"
  );
};

export const resolveRefs = (value: any, deref: (ref: string) => unknown, visited = new Set<object>()): unknown => {
  while (hasRef(value)) {
    const resolved = deref(value.$ref);
    Object.keys(value).forEach((k) => delete value[k]);
    Object.assign(value, resolved);
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
    for (const [key, val] of Object.entries(value)) {
      if (typeof val === "object" && val !== null && visited.has(val)) continue;
      value[key] = resolveRefs(val, deref, visited);
    }
  }

  return value;
};
