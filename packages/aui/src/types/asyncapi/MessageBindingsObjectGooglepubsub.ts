import {MessageBindingsObjectGooglepubsubBindingVersion} from './MessageBindingsObjectGooglepubsubBindingVersion';
import {BindingsMinusGooglepubsubMinus_0Dot_2Dot_0MinusMessageSchema} from './BindingsMinusGooglepubsubMinus_0Dot_2Dot_0MinusMessageSchema';
interface MessageBindingsObjectGooglepubsub {
  'bindingVersion'?: MessageBindingsObjectGooglepubsubBindingVersion;
  'attributes'?: Map<string, any>;
  'orderingKey'?: string;
  'schema'?: BindingsMinusGooglepubsubMinus_0Dot_2Dot_0MinusMessageSchema;
  'additionalProperties'?: Map<string, any>;
}
export { MessageBindingsObjectGooglepubsub };