import {MessageBindingsObjectKafkaBindingVersion} from './MessageBindingsObjectKafkaBindingVersion';
import {Reference} from './Reference';
import {SchemaObject} from './SchemaObject';
import {BindingsMinusKafkaMinus_0Dot_5Dot_0MinusMessageSchemaIdLocation} from './BindingsMinusKafkaMinus_0Dot_5Dot_0MinusMessageSchemaIdLocation';
interface MessageBindingsObjectKafka {
  'bindingVersion'?: MessageBindingsObjectKafkaBindingVersion;
  'key'?: Reference | SchemaObject | boolean;
  'schemaIdLocation'?: BindingsMinusKafkaMinus_0Dot_5Dot_0MinusMessageSchemaIdLocation;
  'schemaIdPayloadEncoding'?: string;
  'schemaLookupStrategy'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { MessageBindingsObjectKafka };