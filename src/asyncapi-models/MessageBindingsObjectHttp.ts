import {MessageBindingsObjectHttpBindingVersion} from './MessageBindingsObjectHttpBindingVersion';
import {SchemaObject} from './SchemaObject';
interface MessageBindingsObjectHttp {
  'bindingVersion'?: MessageBindingsObjectHttpBindingVersion;
  'headers'?: SchemaObject | boolean;
  'statusCode'?: number;
  'additionalProperties'?: Map<string, any>;
}
export { MessageBindingsObjectHttp };