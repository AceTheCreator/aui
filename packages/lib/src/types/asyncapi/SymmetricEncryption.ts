import {SymmetricEncryptionType} from './SymmetricEncryptionType';
interface SymmetricEncryption {
  'type': SymmetricEncryptionType;
  'description'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { SymmetricEncryption };