export const hasRef = (value: unknown): value is { $ref: string } => {
  return (
    typeof value === "object" &&
    value !== null &&
    "$ref" in value &&
    typeof value.$ref === "string"
  );
};
