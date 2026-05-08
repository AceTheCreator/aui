import {Reference} from './Reference';
import {MessageObject} from './MessageObject';
import {Parameter} from './Parameter';
import {Tag} from './Tag';
import {ExternalDocs} from './ExternalDocs';
import {ChannelBindingsObject} from './ChannelBindingsObject';
interface Channel {
  'address'?: string | null;
  'messages'?: Map<string, Reference | MessageObject>;
  'parameters'?: Map<string, Reference | Parameter>;
  'title'?: string;
  'summary'?: string;
  'description'?: string;
  'servers'?: Reference[];
  'tags'?: (Reference | Tag)[];
  'externalDocs'?: Reference | ExternalDocs;
  'bindings'?: Reference | ChannelBindingsObject;
  'additionalProperties'?: Map<string, any>;
}
export { Channel };