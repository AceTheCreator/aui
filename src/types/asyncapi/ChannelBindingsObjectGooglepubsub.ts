import {ChannelBindingsObjectGooglepubsubBindingVersion} from './ChannelBindingsObjectGooglepubsubBindingVersion';
import {BindingsMinusGooglepubsubMinus_0Dot_2Dot_0MinusChannelMessageStoragePolicy} from './BindingsMinusGooglepubsubMinus_0Dot_2Dot_0MinusChannelMessageStoragePolicy';
import {BindingsMinusGooglepubsubMinus_0Dot_2Dot_0MinusChannelSchemaSettings} from './BindingsMinusGooglepubsubMinus_0Dot_2Dot_0MinusChannelSchemaSettings';
interface ChannelBindingsObjectGooglepubsub {
  'bindingVersion'?: ChannelBindingsObjectGooglepubsubBindingVersion;
  'labels'?: Map<string, any>;
  'messageRetentionDuration'?: string;
  'messageStoragePolicy'?: BindingsMinusGooglepubsubMinus_0Dot_2Dot_0MinusChannelMessageStoragePolicy;
  'schemaSettings'?: BindingsMinusGooglepubsubMinus_0Dot_2Dot_0MinusChannelSchemaSettings;
  'additionalProperties'?: Map<string, any>;
}
export { ChannelBindingsObjectGooglepubsub };