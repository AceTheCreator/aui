import {MessageBindingsObjectAnypointmqBindingVersion} from './MessageBindingsObjectAnypointmqBindingVersion';
import {SchemaObject} from './SchemaObject';
import {Reference} from './Reference';
interface MessageBindingsObjectAnypointmq {
  'bindingVersion'?: MessageBindingsObjectAnypointmqBindingVersion;
  'headers'?: SchemaObject | boolean | Reference;
  'additionalProperties'?: Map<string, any>;
}
export { MessageBindingsObjectAnypointmq };