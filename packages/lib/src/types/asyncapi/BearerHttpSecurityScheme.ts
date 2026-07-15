import {BearerHttpSecuritySchemeScheme} from './BearerHttpSecuritySchemeScheme';
import {BearerHttpSecuritySchemeType} from './BearerHttpSecuritySchemeType';
interface BearerHttpSecurityScheme {
  'scheme': BearerHttpSecuritySchemeScheme;
  'bearerFormat'?: string;
  'type': BearerHttpSecuritySchemeType;
  'description'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { BearerHttpSecurityScheme };