import {Oauth2FlowsFlowsImplicit} from './Oauth2FlowsFlowsImplicit';
import {Oauth2FlowsFlowsPassword} from './Oauth2FlowsFlowsPassword';
import {Oauth2FlowsFlowsClientCredentials} from './Oauth2FlowsFlowsClientCredentials';
import {Oauth2FlowsFlowsAuthorizationCode} from './Oauth2FlowsFlowsAuthorizationCode';
interface Oauth2FlowsFlows {
  'implicit'?: Oauth2FlowsFlowsImplicit;
  'password'?: Oauth2FlowsFlowsPassword;
  'clientCredentials'?: Oauth2FlowsFlowsClientCredentials;
  'authorizationCode'?: Oauth2FlowsFlowsAuthorizationCode;
}
export { Oauth2FlowsFlows };