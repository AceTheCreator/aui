import {ChannelBindingsObjectPulsarBindingVersion} from './ChannelBindingsObjectPulsarBindingVersion';
import {BindingsMinusPulsarMinus_0Dot_1Dot_0MinusChannelPersistence} from './BindingsMinusPulsarMinus_0Dot_1Dot_0MinusChannelPersistence';
import {BindingsMinusPulsarMinus_0Dot_1Dot_0MinusChannelRetention} from './BindingsMinusPulsarMinus_0Dot_1Dot_0MinusChannelRetention';
interface ChannelBindingsObjectPulsar {
  'bindingVersion'?: ChannelBindingsObjectPulsarBindingVersion;
  'namespace'?: string;
  'persistence'?: BindingsMinusPulsarMinus_0Dot_1Dot_0MinusChannelPersistence;
  'compaction'?: number;
  'geo-replication'?: string[];
  'retention'?: BindingsMinusPulsarMinus_0Dot_1Dot_0MinusChannelRetention;
  'ttl'?: number;
  'deduplication'?: boolean;
  'additionalProperties'?: Map<string, any>;
}
export { ChannelBindingsObjectPulsar };