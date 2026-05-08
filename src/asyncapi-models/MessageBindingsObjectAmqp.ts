import {MessageBindingsObjectAmqpBindingVersion} from './MessageBindingsObjectAmqpBindingVersion';
interface MessageBindingsObjectAmqp {
  'bindingVersion'?: MessageBindingsObjectAmqpBindingVersion;
  'contentEncoding'?: string;
  'messageType'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { MessageBindingsObjectAmqp };