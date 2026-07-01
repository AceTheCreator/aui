import {ServerBindingsObjectKafkaBindingVersion} from './ServerBindingsObjectKafkaBindingVersion';
interface ServerBindingsObjectKafka {
  'bindingVersion'?: ServerBindingsObjectKafkaBindingVersion;
  'schemaRegistryUrl'?: string;
  'schemaRegistryVendor'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { ServerBindingsObjectKafka };