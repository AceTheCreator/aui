import {AnySchemaObject} from './AnySchemaObject';
import {Reference} from './Reference';
import {CorrelationId} from './CorrelationId';
import {Tag} from './Tag';
import {ExternalDocs} from './ExternalDocs';
import {MessageBindingsObject} from './MessageBindingsObject';
interface MessageTrait {
  'contentType'?: string;
  'headers'?: AnySchemaObject | boolean;
  'correlationId'?: Reference | CorrelationId;
  'tags'?: (Reference | Tag)[];
  'summary'?: string;
  'name'?: string;
  'title'?: string;
  'description'?: string;
  'externalDocs'?: Reference | ExternalDocs;
  'deprecated'?: boolean;
  'examples'?: (any | any)[];
  'bindings'?: Reference | MessageBindingsObject;
  'additionalProperties'?: Map<string, any>;
}
export { MessageTrait };