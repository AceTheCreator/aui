import {OperationBindingsObjectAmqpBindingVersion} from './OperationBindingsObjectAmqpBindingVersion';
import {BindingsMinusAmqpMinus_0Dot_3Dot_0MinusOperationDeliveryMode} from './BindingsMinusAmqpMinus_0Dot_3Dot_0MinusOperationDeliveryMode';
interface OperationBindingsObjectAmqp {
  'bindingVersion'?: OperationBindingsObjectAmqpBindingVersion;
  'expiration'?: number;
  'userId'?: string;
  'cc'?: string[];
  'priority'?: number;
  'deliveryMode'?: BindingsMinusAmqpMinus_0Dot_3Dot_0MinusOperationDeliveryMode;
  'mandatory'?: boolean;
  'bcc'?: string[];
  'timestamp'?: boolean;
  'ack'?: boolean;
  'additionalProperties'?: Map<string, any>;
}
export { OperationBindingsObjectAmqp };