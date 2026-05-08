import {OperationBindingsObjectMqttBindingVersion} from './OperationBindingsObjectMqttBindingVersion';
import {BindingsMinusMqttMinus_0Dot_2Dot_0MinusOperationQos} from './BindingsMinusMqttMinus_0Dot_2Dot_0MinusOperationQos';
import {SchemaObject} from './SchemaObject';
import {Reference} from './Reference';
interface OperationBindingsObjectMqtt {
  'bindingVersion'?: OperationBindingsObjectMqttBindingVersion;
  'qos'?: BindingsMinusMqttMinus_0Dot_2Dot_0MinusOperationQos;
  'retain'?: boolean;
  'messageExpiryInterval'?: number | SchemaObject | boolean | Reference;
  'additionalProperties'?: Map<string, any>;
}
export { OperationBindingsObjectMqtt };