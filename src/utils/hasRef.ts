export const hasRef = (value: any): value is { $ref: string } => {
  return (
    typeof value === "object" &&
    value !== null &&
    "$ref" in value &&
    typeof value.$ref === "string"
  );
};

export const resolveRefs = (value: any, deref: (ref: string) => any): any => {
  if (hasRef(value)) {
    const resolved = deref(value.$ref);
    Object.keys(value).forEach((k) => delete value[k]);
    Object.assign(value, resolved);
  }

  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      value[i] = resolveRefs(item, deref);
    });
  } else if (typeof value === "object" && value !== null) {
    for (const [key, val] of Object.entries(value)) {
      value[key] = resolveRefs(val, deref);
    }
  }

  return value;
};
