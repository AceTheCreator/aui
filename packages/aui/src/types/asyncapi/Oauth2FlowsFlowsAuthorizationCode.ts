
interface Oauth2FlowsFlowsAuthorizationCode {
  'authorizationUrl': string;
  'tokenUrl': string;
  'refreshUrl'?: string;
  'availableScopes': Map<string, string>;
  'additionalProperties'?: Map<string, any>;
}
export { Oauth2FlowsFlowsAuthorizationCode };