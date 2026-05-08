import {SaslPlainSecuritySchemeType} from './SaslPlainSecuritySchemeType';
interface SaslPlainSecurityScheme {
  'type': SaslPlainSecuritySchemeType;
  'description'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { SaslPlainSecurityScheme };