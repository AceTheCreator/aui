import { ExternalDocs, Tags } from "./metadata";
import { SecurityInterface, ServerInterface } from "./server";

export enum PayloadType {
  SEND = "send",
  RECEIVE = "receive",
  REQUEST = "request",
  REPLY = "reply",
}

export interface OperationInterface {
  action: OperationAction;
  summary?: string;
  title?: string;
  description?: string;
  security?: SecurityInterface;
  tags?: Tags[];
  externalDocs?: ExternalDocs;
  reply?: OperationReplyInterface;
  messages: any;
}

export interface OperationReplyInterface {
  id: string | undefined;
  address: OperationReplyAddressInterface;
  channel: ChannelInterface;
}

export interface ChannelInterface {
  address: string | null | undefined;
  title?: string;
  summary?: string;
  description?: string;
  servers: ServerInterface[];
}

export interface ChannelParameterInterface {
  description: string;
  location: string;
}

export interface OperationReplyAddressInterface {
  id: string | undefined;
  location: string;
}
export type OperationAction = "send" | "recieve";
