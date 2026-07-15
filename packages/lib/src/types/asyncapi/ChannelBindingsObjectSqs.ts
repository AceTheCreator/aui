import {ChannelBindingsObjectSqsBindingVersion} from './ChannelBindingsObjectSqsBindingVersion';
import {BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueue} from './BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueue';
interface ChannelBindingsObjectSqs {
  'bindingVersion'?: ChannelBindingsObjectSqsBindingVersion;
  'queue'?: BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueue;
  'deadLetterQueue'?: BindingsMinusSqsMinus_0Dot_2Dot_0MinusChannelQueue;
  'additionalProperties'?: Map<string, any>;
}
export { ChannelBindingsObjectSqs };