import {ServerBindingsObjectIbmmqBindingVersion} from './ServerBindingsObjectIbmmqBindingVersion';
interface ServerBindingsObjectIbmmq {
  'bindingVersion'?: ServerBindingsObjectIbmmqBindingVersion;
  'groupId'?: string;
  'ccdtQueueManagerName'?: string;
  'cipherSpec'?: string;
  'multiEndpointServer'?: boolean;
  'heartBeatInterval'?: number;
  'additionalProperties'?: Map<string, any>;
}
export { ServerBindingsObjectIbmmq };