import {OperationBindingsObjectHttpBindingVersion} from './OperationBindingsObjectHttpBindingVersion';
import {BindingsMinusHttpMinus_0Dot_3Dot_0MinusOperationMethod} from './BindingsMinusHttpMinus_0Dot_3Dot_0MinusOperationMethod';
import {SchemaObject} from './SchemaObject';
interface OperationBindingsObjectHttp {
  'bindingVersion'?: OperationBindingsObjectHttpBindingVersion;
  'method'?: BindingsMinusHttpMinus_0Dot_3Dot_0MinusOperationMethod;
  'query'?: SchemaObject | boolean;
  'additionalProperties'?: Map<string, any>;
}
export { OperationBindingsObjectHttp };