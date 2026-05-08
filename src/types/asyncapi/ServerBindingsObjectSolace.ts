import {ServerBindingsObjectSolaceBindingVersion} from './ServerBindingsObjectSolaceBindingVersion';
interface ServerBindingsObjectSolace {
  'bindingVersion'?: ServerBindingsObjectSolaceBindingVersion;
  'msgVpn'?: string;
  'clientName'?: string;
  'msvVpn'?: string;
  'additionalProperties'?: Map<string, any>;
}
export { ServerBindingsObjectSolace };