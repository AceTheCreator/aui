import {OperationBindingsObjectSolaceBindingVersion} from './OperationBindingsObjectSolaceBindingVersion';
import {BindingsMinusSolaceMinus_0Dot_4Dot_0MinusOperationDestinationsItemOneOf_0} from './BindingsMinusSolaceMinus_0Dot_4Dot_0MinusOperationDestinationsItemOneOf_0';
import {BindingsMinusSolaceMinus_0Dot_4Dot_0MinusOperationDestinationsItemOneOf_1} from './BindingsMinusSolaceMinus_0Dot_4Dot_0MinusOperationDestinationsItemOneOf_1';
interface OperationBindingsObjectSolace {
  'bindingVersion'?: OperationBindingsObjectSolaceBindingVersion;
  'destinations'?: (BindingsMinusSolaceMinus_0Dot_4Dot_0MinusOperationDestinationsItemOneOf_0 | BindingsMinusSolaceMinus_0Dot_4Dot_0MinusOperationDestinationsItemOneOf_1)[];
  'timeToLive'?: number;
  'priority'?: number;
  'dmqEligible'?: boolean;
}
export { OperationBindingsObjectSolace };