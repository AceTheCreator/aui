import {BindingsMinusKafkaMinus_0Dot_5Dot_0MinusChannelTopicConfigurationCleanupDotPolicyItem} from './BindingsMinusKafkaMinus_0Dot_5Dot_0MinusChannelTopicConfigurationCleanupDotPolicyItem';
interface BindingsMinusKafkaMinus_0Dot_5Dot_0MinusChannelTopicConfiguration {
  'cleanup.policy'?: BindingsMinusKafkaMinus_0Dot_5Dot_0MinusChannelTopicConfigurationCleanupDotPolicyItem[];
  'retention.ms'?: number;
  'retention.bytes'?: number;
  'delete.retention.ms'?: number;
  'max.message.bytes'?: number;
  'confluent.key.schema.validation'?: boolean;
  'confluent.key.subject.name.strategy'?: string;
  'confluent.value.schema.validation'?: boolean;
  'confluent.value.subject.name.strategy'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { BindingsMinusKafkaMinus_0Dot_5Dot_0MinusChannelTopicConfiguration };