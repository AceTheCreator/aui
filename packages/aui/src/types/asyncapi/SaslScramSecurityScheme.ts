import {SaslScramSecuritySchemeType} from './SaslScramSecuritySchemeType';
interface SaslScramSecurityScheme {
  'type': SaslScramSecuritySchemeType;
  'description'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { SaslScramSecurityScheme };