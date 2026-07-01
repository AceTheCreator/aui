import {AsymmetricEncryptionType} from './AsymmetricEncryptionType';
interface AsymmetricEncryption {
  'type': AsymmetricEncryptionType;
  'description'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { AsymmetricEncryption };