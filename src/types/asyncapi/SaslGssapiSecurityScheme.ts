import {SaslGssapiSecuritySchemeType} from './SaslGssapiSecuritySchemeType';
interface SaslGssapiSecurityScheme {
  'type': SaslGssapiSecuritySchemeType;
  'description'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { SaslGssapiSecurityScheme };