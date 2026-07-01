import {ChannelBindingsObjectKafkaBindingVersion} from './ChannelBindingsObjectKafkaBindingVersion';
import {BindingsMinusKafkaMinus_0Dot_5Dot_0MinusChannelTopicConfiguration} from './BindingsMinusKafkaMinus_0Dot_5Dot_0MinusChannelTopicConfiguration';
interface ChannelBindingsObjectKafka {
  'bindingVersion'?: ChannelBindingsObjectKafkaBindingVersion;
  'topic'?: string;
  'partitions'?: number;
  'replicas'?: number;
  'topicConfiguration'?: BindingsMinusKafkaMinus_0Dot_5Dot_0MinusChannelTopicConfiguration;
  'additionalProperties'?: Map<string, any>;
}
export { ChannelBindingsObjectKafka };