import {MessageBindingsObjectHttp} from './MessageBindingsObjectHttp';
import {MessageBindingsObjectAmqp} from './MessageBindingsObjectAmqp';
import {MessageBindingsObjectMqtt} from './MessageBindingsObjectMqtt';
import {MessageBindingsObjectKafka} from './MessageBindingsObjectKafka';
import {MessageBindingsObjectAnypointmq} from './MessageBindingsObjectAnypointmq';
import {MessageBindingsObjectJms} from './MessageBindingsObjectJms';
import {MessageBindingsObjectIbmmq} from './MessageBindingsObjectIbmmq';
import {MessageBindingsObjectGooglepubsub} from './MessageBindingsObjectGooglepubsub';
interface MessageBindingsObject {
  'http'?: MessageBindingsObjectHttp;
  'ws'?: any;
  'amqp'?: MessageBindingsObjectAmqp;
  'amqp1'?: any;
  'mqtt'?: MessageBindingsObjectMqtt;
  'kafka'?: MessageBindingsObjectKafka;
  'anypointmq'?: MessageBindingsObjectAnypointmq;
  'nats'?: any;
  'jms'?: MessageBindingsObjectJms;
  'sns'?: any;
  'sqs'?: any;
  'stomp'?: any;
  'redis'?: any;
  'ibmmq'?: MessageBindingsObjectIbmmq;
  'solace'?: any;
  'googlepubsub'?: MessageBindingsObjectGooglepubsub;
  'additionalProperties'?: Map<string, any>;
}
export { MessageBindingsObject };