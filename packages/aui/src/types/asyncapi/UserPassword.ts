import {UserPasswordType} from './UserPasswordType';
interface UserPassword {
  'type': UserPasswordType;
  'description'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { UserPassword };