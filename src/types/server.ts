import { Tags, ExternalDocs } from "./metadata";

export interface ServerInterface {
  host: string;
  description?: string;
  pathname: string;
  protocol: string;
  protocolVersion: number;
  variables?: {
    [key: string]: ServerVariablesInterface;
  };
  security?: SecurityInterface[];
  tags?: Tags[];
  externalDocs?: ExternalDocs;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bindings?: any;
}

export interface ServerVariablesInterface {
  enum?: Array<string>;
  default: string;
  description: string;
  examples: Array<string>;
}

export interface SecurityInterface {
  name?: string;
  type: string;
  description?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsInterface;
  openIdConnectUrl?: string;
  scopes?: string[];
}

export type FlowType =
  | "authorizationCode"
  | "implicit"
  | "password"
  | "clientCredentials";

export interface OAuthFlowsInterface {
  implicit?: OAuthFlowInterface;
  password?: OAuthFlowInterface;
  clientCredentials?: OAuthFlowInterface;
  authorizationCode?: OAuthFlowInterface;
}

export interface OAuthFlowInterface {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  availableScopes: Record<string, string>;
}
