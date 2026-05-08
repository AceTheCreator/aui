import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumerProtocol} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumerProtocol';
import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationIdentifier} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationIdentifier';
import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumerFilterPolicyScope} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumerFilterPolicyScope';
import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationRedrivePolicy} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationRedrivePolicy';
import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicy} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicy';
interface BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumer {
  'protocol': BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumerProtocol;
  'endpoint': BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationIdentifier;
  'filterPolicy'?: Map<string, string[] | string | Map<string, any> | any>;
  'filterPolicyScope'?: BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumerFilterPolicyScope;
  'rawMessageDelivery': boolean;
  'redrivePolicy'?: BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationRedrivePolicy;
  'deliveryPolicy'?: BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicy;
  'displayName'?: string;
  'additionalProperties'?: Map<string, any | any>;
}
export { BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumer };