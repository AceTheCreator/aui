import {ChannelBindingsObjectWsBindingVersion} from './ChannelBindingsObjectWsBindingVersion';
import {BindingsMinusWebsocketsMinus_0Dot_1Dot_0MinusChannelMethod} from './BindingsMinusWebsocketsMinus_0Dot_1Dot_0MinusChannelMethod';
import {SchemaObject} from './SchemaObject';
import {Reference} from './Reference';
interface ChannelBindingsObjectWs {
  'bindingVersion'?: ChannelBindingsObjectWsBindingVersion;
  'method'?: BindingsMinusWebsocketsMinus_0Dot_1Dot_0MinusChannelMethod;
  'query'?: SchemaObject | boolean | Reference;
  'headers'?: SchemaObject | boolean | Reference;
  'additionalProperties'?: Map<string, any>;
}
export { ChannelBindingsObjectWs };