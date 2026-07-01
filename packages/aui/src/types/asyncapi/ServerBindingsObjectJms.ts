import {ServerBindingsObjectJmsBindingVersion} from './ServerBindingsObjectJmsBindingVersion';
import {BindingsMinusJmsMinus_0Dot_0Dot_1MinusServerProperty} from './BindingsMinusJmsMinus_0Dot_0Dot_1MinusServerProperty';
interface ServerBindingsObjectJms {
  'bindingVersion'?: ServerBindingsObjectJmsBindingVersion;
  'jmsConnectionFactory'?: string;
  'properties'?: BindingsMinusJmsMinus_0Dot_0Dot_1MinusServerProperty[];
  'clientID'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { ServerBindingsObjectJms };