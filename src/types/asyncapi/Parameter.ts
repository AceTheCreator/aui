
interface Parameter {
  'description'?: string;
  'enum'?: string[];
  'default'?: string;
  'examples'?: string[];
  'location'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { Parameter };