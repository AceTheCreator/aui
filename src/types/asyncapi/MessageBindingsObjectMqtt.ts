import {MessageBindingsObjectMqttBindingVersion} from './MessageBindingsObjectMqttBindingVersion';
import {BindingsMinusMqttMinus_0Dot_2Dot_0MinusMessagePayloadFormatIndicator} from './BindingsMinusMqttMinus_0Dot_2Dot_0MinusMessagePayloadFormatIndicator';
import {SchemaObject} from './SchemaObject';
import {Reference} from './Reference';
interface MessageBindingsObjectMqtt {
  'bindingVersion'?: MessageBindingsObjectMqttBindingVersion;
  'payloadFormatIndicator'?: BindingsMinusMqttMinus_0Dot_2Dot_0MinusMessagePayloadFormatIndicator;
  'correlationData'?: SchemaObject | boolean | Reference;
  'contentType'?: string;
  'responseTopic'?: string | SchemaObject | boolean | Reference;
  'additionalProperties'?: Map<string, any>;
}
export { MessageBindingsObjectMqtt };