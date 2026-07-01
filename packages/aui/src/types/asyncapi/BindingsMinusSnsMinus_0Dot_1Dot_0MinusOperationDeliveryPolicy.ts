import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicyBackoffFunction} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicyBackoffFunction';
interface BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicy {
  'minDelayTarget'?: number;
  'maxDelayTarget'?: number;
  'numRetries'?: number;
  'numNoDelayRetries'?: number;
  'numMinDelayRetries'?: number;
  'numMaxDelayRetries'?: number;
  'backoffFunction'?: BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicyBackoffFunction;
  'maxReceivesPerSecond'?: number;
  'additionalProperties'?: Map<string, any | any>;
}
export { BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicy };