import {OperationBindingsObjectHttp} from './OperationBindingsObjectHttp';
import {OperationBindingsObjectAmqp} from './OperationBindingsObjectAmqp';
import {OperationBindingsObjectMqtt} from './OperationBindingsObjectMqtt';
import {OperationBindingsObjectKafka} from './OperationBindingsObjectKafka';
import {OperationBindingsObjectNats} from './OperationBindingsObjectNats';
import {OperationBindingsObjectSns} from './OperationBindingsObjectSns';
import {OperationBindingsObjectSqs} from './OperationBindingsObjectSqs';
import {OperationBindingsObjectSolace} from './OperationBindingsObjectSolace';
interface OperationBindingsObject {
  'http'?: OperationBindingsObjectHttp;
  'ws'?: any;
  'amqp'?: OperationBindingsObjectAmqp;
  'amqp1'?: any;
  'mqtt'?: OperationBindingsObjectMqtt;
  'kafka'?: OperationBindingsObjectKafka;
  'anypointmq'?: any;
  'nats'?: OperationBindingsObjectNats;
  'jms'?: any;
  'sns'?: OperationBindingsObjectSns;
  'sqs'?: OperationBindingsObjectSqs;
  'stomp'?: any;
  'redis'?: any;
  'ibmmq'?: any;
  'solace'?: OperationBindingsObjectSolace;
  'googlepubsub'?: any;
  'additionalProperties'?: Map<string, any>;
}
export { OperationBindingsObject };