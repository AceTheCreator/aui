import {Reference} from './Reference';
import {OperationReplyAddress} from './OperationReplyAddress';
interface OperationReply {
  'address'?: Reference | OperationReplyAddress;
  'channel'?: Reference;
  'messages'?: Reference[];
  'additionalProperties'?: Map<string, any>;
}
export { OperationReply };