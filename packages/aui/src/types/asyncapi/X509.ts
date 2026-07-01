import {X509Type} from './X509Type';
interface X509 {
  'type': X509Type;
  'description'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { X509 };