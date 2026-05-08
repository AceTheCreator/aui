import {ApiKeyType} from './ApiKeyType';
import {ApiKeyIn} from './ApiKeyIn';
interface ApiKey {
  'type': ApiKeyType;
  'in': ApiKeyIn;
  'description'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { ApiKey };