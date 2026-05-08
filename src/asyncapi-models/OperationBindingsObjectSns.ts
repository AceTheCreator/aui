import {OperationBindingsObjectSnsBindingVersion} from './OperationBindingsObjectSnsBindingVersion';
import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationIdentifier} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationIdentifier';
import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumer} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumer';
import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicy} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicy';
interface OperationBindingsObjectSns {
  'bindingVersion'?: OperationBindingsObjectSnsBindingVersion;
  'topic'?: BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationIdentifier;
  'consumers'?: BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationConsumer[];
  'deliveryPolicy'?: BindingsMinusSnsMinus_0Dot_1Dot_0MinusOperationDeliveryPolicy;
  'additionalProperties'?: Map<string, any>;
}
export { OperationBindingsObjectSns };