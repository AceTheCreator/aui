import {Info} from './Info';
import {Reference} from './Reference';
import {Server} from './Server';
import {Channel} from './Channel';
import {Operation} from './Operation';
import {Components} from './Components';
interface AsyncApi_3Dot_0Dot_0SchemaDot {
  'asyncapi': '3.0.0';
  'id'?: string;
  'info': Info;
  'servers'?: Map<string, Reference | Server>;
  'defaultContentType'?: string;
  'channels'?: Map<string, Reference | Channel>;
  'operations'?: Map<string, Reference | Operation>;
  'components'?: Components;
  'additionalProperties'?: Map<string, any>;
}
export { AsyncApi_3Dot_0Dot_0SchemaDot };