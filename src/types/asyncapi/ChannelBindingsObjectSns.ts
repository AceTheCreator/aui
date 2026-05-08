import {ChannelBindingsObjectSnsBindingVersion} from './ChannelBindingsObjectSnsBindingVersion';
import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusChannelOrdering} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusChannelOrdering';
import {BindingsMinusSnsMinus_0Dot_1Dot_0MinusChannelPolicy} from './BindingsMinusSnsMinus_0Dot_1Dot_0MinusChannelPolicy';
interface ChannelBindingsObjectSns {
  'bindingVersion'?: ChannelBindingsObjectSnsBindingVersion;
  'name'?: string;
  'ordering'?: BindingsMinusSnsMinus_0Dot_1Dot_0MinusChannelOrdering;
  'policy'?: BindingsMinusSnsMinus_0Dot_1Dot_0MinusChannelPolicy;
  'tags'?: Map<string, any>;
  'additionalProperties'?: Map<string, any>;
}
export { ChannelBindingsObjectSns };