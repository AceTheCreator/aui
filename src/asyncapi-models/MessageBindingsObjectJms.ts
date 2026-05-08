import {MessageBindingsObjectJmsBindingVersion} from './MessageBindingsObjectJmsBindingVersion';
import {SchemaObject} from './SchemaObject';
interface MessageBindingsObjectJms {
  'bindingVersion'?: MessageBindingsObjectJmsBindingVersion;
  'headers'?: SchemaObject | boolean;
  'additionalProperties'?: Map<string, any>;
}
export { MessageBindingsObjectJms };