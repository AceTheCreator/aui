import {BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueueDeduplicationScope} from './BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueueDeduplicationScope';
import {BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueueFifoThroughputLimit} from './BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueueFifoThroughputLimit';
import {BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelRedrivePolicy} from './BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelRedrivePolicy';
import {BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelPolicy} from './BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelPolicy';
interface BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueue {
  'name': string;
  'fifoQueue': boolean;
  'deduplicationScope'?: BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueueDeduplicationScope;
  'fifoThroughputLimit'?: BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueueFifoThroughputLimit;
  'deliveryDelay'?: number;
  'visibilityTimeout'?: number;
  'receiveMessageWaitTime'?: number;
  'messageRetentionPeriod'?: number;
  'redrivePolicy'?: BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelRedrivePolicy;
  'policy'?: BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelPolicy;
  'tags'?: Map<string, any>;
  'additionalProperties'?: Map<string, any | any>;
}
export { BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueue };