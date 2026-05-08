import {ApiKeyHttpSecuritySchemeType} from './ApiKeyHttpSecuritySchemeType';
import {ApiKeyHttpSecuritySchemeIn} from './ApiKeyHttpSecuritySchemeIn';
interface ApiKeyHttpSecurityScheme {
  'type': ApiKeyHttpSecuritySchemeType;
  'name': string;
  'in': ApiKeyHttpSecuritySchemeIn;
  'description'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { ApiKeyHttpSecurityScheme };