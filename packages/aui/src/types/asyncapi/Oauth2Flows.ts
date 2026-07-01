import {Oauth2FlowsType} from './Oauth2FlowsType';
import {Oauth2FlowsFlows} from './Oauth2FlowsFlows';
interface Oauth2Flows {
  'type': Oauth2FlowsType;
  'description'?: string;
  'flows': Oauth2FlowsFlows;
  'scopes'?: string[];
  'additionalProperties'?: Map<string, any | any>;
}
export { Oauth2Flows };