import {ServerBindingsObjectMqttBindingVersion} from './ServerBindingsObjectMqttBindingVersion';
import {BindingsMinusMqttMinus_0Dot_2Dot_0MinusServerLastWill} from './BindingsMinusMqttMinus_0Dot_2Dot_0MinusServerLastWill';
import {SchemaObject} from './SchemaObject';
import {Reference} from './Reference';
interface ServerBindingsObjectMqtt {
  'bindingVersion'?: ServerBindingsObjectMqttBindingVersion;
  'clientId'?: string;
  'cleanSession'?: boolean;
  'lastWill'?: BindingsMinusMqttMinus_0Dot_2Dot_0MinusServerLastWill;
  'keepAlive'?: number;
  'sessionExpiryInterval'?: number | SchemaObject | boolean | Reference;
  'maximumPacketSize'?: number | SchemaObject | boolean | Reference;
  'additionalProperties'?: Map<string, any>;
}
export { ServerBindingsObjectMqtt };