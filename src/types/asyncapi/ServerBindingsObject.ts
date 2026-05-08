import {ServerBindingsObjectMqtt} from './ServerBindingsObjectMqtt';
import {ServerBindingsObjectKafka} from './ServerBindingsObjectKafka';
import {ServerBindingsObjectJms} from './ServerBindingsObjectJms';
import {ServerBindingsObjectIbmmq} from './ServerBindingsObjectIbmmq';
import {ServerBindingsObjectSolace} from './ServerBindingsObjectSolace';
import {ServerBindingsObjectPulsar} from './ServerBindingsObjectPulsar';
interface ServerBindingsObject {
  'http'?: any;
  'ws'?: any;
  'amqp'?: any;
  'amqp1'?: any;
  'mqtt'?: ServerBindingsObjectMqtt;
  'kafka'?: ServerBindingsObjectKafka;
  'anypointmq'?: any;
  'nats'?: any;
  'jms'?: ServerBindingsObjectJms;
  'sns'?: any;
  'sqs'?: any;
  'stomp'?: any;
  'redis'?: any;
  'ibmmq'?: ServerBindingsObjectIbmmq;
  'solace'?: ServerBindingsObjectSolace;
  'googlepubsub'?: any;
  'pulsar'?: ServerBindingsObjectPulsar;
  'additionalProperties'?: Map<string, any>;
}
export { ServerBindingsObject };