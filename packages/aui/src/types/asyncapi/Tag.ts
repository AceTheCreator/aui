import {Reference} from './Reference';
import {ExternalDocs} from './ExternalDocs';
interface Tag {
  'name': string;
  'description'?: string;
  'externalDocs'?: Reference | ExternalDocs;
  'additionalProperties'?: Map<string, any>;
}
export { Tag };