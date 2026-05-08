import {OperationBindingsObjectNatsBindingVersion} from './OperationBindingsObjectNatsBindingVersion';
interface OperationBindingsObjectNats {
  'bindingVersion'?: OperationBindingsObjectNatsBindingVersion;
  'queue'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { OperationBindingsObjectNats };