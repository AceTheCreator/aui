import {OpenIdConnectType} from './OpenIdConnectType';
interface OpenIdConnect {
  'type': OpenIdConnectType;
  'description'?: string;
  'openIdConnectUrl': string;
  'scopes'?: string[];
  'additionalProperties'?: Map<string, any>;
}
export { OpenIdConnect };