import {Contact} from './Contact';
import {License} from './License';
import {Reference} from './Reference';
import {Tag} from './Tag';
import {ExternalDocs} from './ExternalDocs';
interface Info {
  'title': string;
  'version': string;
  'description'?: string;
  'termsOfService'?: string;
  'contact'?: Contact;
  'license'?: License;
  'tags'?: (Reference | Tag)[];
  'externalDocs'?: Reference | ExternalDocs;
  'x-x'?: string;
  'x-linkedin'?: string;
  'additionalProperties'?: Map<string, any | any>;
}
export { Info };