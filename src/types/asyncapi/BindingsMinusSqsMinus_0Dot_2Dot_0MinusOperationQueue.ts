import {BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationQueueDeduplicationScope} from './BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationQueueDeduplicationScope';
import {BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationQueueFifoThroughputLimit} from './BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationQueueFifoThroughputLimit';
import {BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationRedrivePolicy} from './BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationRedrivePolicy';
import {BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationPolicy} from './BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationPolicy';
interface BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationQueue {
  '$ref'?: string;
  'name': string;
  'fifoQueue'?: boolean;
  'deduplicationScope'?: BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationQueueDeduplicationScope;
  'fifoThroughputLimit'?: BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationQueueFifoThroughputLimit;
  'deliveryDelay'?: number;
  'visibilityTimeout'?: number;
  'receiveMessageWaitTime'?: number;
  'messageRetentionPeriod'?: number;
  'redrivePolicy'?: BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationRedrivePolicy;
  'policy'?: BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationPolicy;
  'tags'?: Map<string, any>;
  'additionalProperties'?: Map<string, any | any>;
}
export { BindingsMinusSqsMinus_0Dot_2Dot_0MinusOperationQueue };