import {Reference} from './Reference';
import {UserPassword} from './UserPassword';
import {ApiKey} from './ApiKey';
import {X509} from './X509';
import {SymmetricEncryption} from './SymmetricEncryption';
import {AsymmetricEncryption} from './AsymmetricEncryption';
import {BearerHttpSecurityScheme} from './BearerHttpSecurityScheme';
import {ApiKeyHttpSecurityScheme} from './ApiKeyHttpSecurityScheme';
import {Oauth2Flows} from './Oauth2Flows';
import {OpenIdConnect} from './OpenIdConnect';
import {SaslPlainSecurityScheme} from './SaslPlainSecurityScheme';
import {SaslScramSecurityScheme} from './SaslScramSecurityScheme';
import {SaslGssapiSecurityScheme} from './SaslGssapiSecurityScheme';
import {Tag} from './Tag';
import {ExternalDocs} from './ExternalDocs';
import {OperationBindingsObject} from './OperationBindingsObject';
interface OperationTrait {
  'title'?: string;
  'summary'?: string;
  'description'?: string;
  'security'?: (Reference | UserPassword | ApiKey | X509 | SymmetricEncryption | AsymmetricEncryption | any | BearerHttpSecurityScheme | ApiKeyHttpSecurityScheme | Oauth2Flows | OpenIdConnect | SaslPlainSecurityScheme | SaslScramSecurityScheme | SaslGssapiSecurityScheme)[];
  'tags'?: (Reference | Tag)[];
  'externalDocs'?: Reference | ExternalDocs;
  'bindings'?: Reference | OperationBindingsObject;
  'additionalProperties'?: Map<string, any>;
}
export { OperationTrait };