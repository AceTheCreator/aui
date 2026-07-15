import {OperationBindingsObjectKafkaBindingVersion} from './OperationBindingsObjectKafkaBindingVersion';
import {SchemaObject} from './SchemaObject';
interface OperationBindingsObjectKafka {
  'bindingVersion'?: OperationBindingsObjectKafkaBindingVersion;
  'groupId'?: SchemaObject | boolean;
  'clientId'?: SchemaObject | boolean;
  'additionalProperties'?: Map<string, any>;
}
export { OperationBindingsObjectKafka };