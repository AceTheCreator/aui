import { Tags, ExternalDocs, } from "./metadata";

export interface ServerInterface {
    host: string;
    description?: string | undefined;
    pathname: string | undefined;
    protocol: string;
    protocolVersion: number | undefined;
    variables?: {
      [key: string]: ServerVariablesInterface
    };
    security?: SecurityInterface[];
    tags?: Tags[];
    externalDocs?: ExternalDocs;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bindings?: any;
  }

  export interface ServerVariablesInterface {
    enum?: Array<string>;
    default: string | undefined;
    description: string | undefined;
    examples: Array<string>;
  }

  export interface SecurityInterface {
    name?: string | undefined;
    type: string;
    description?: string | undefined;
    in?: string | undefined;
    scheme?: string | undefined;
    bearerFormat?: string | undefined;
    flows?: OAuthFlowsInterface | undefined;
    openIdConnectUrl?: string | undefined;
    scopes?: string[];
  }

  export interface OAuthFlowsInterface{
    implicit?: OAuthFlowInterface | undefined;
    password?: OAuthFlowInterface | undefined;
    clientCredentials?: OAuthFlowInterface | undefined;
    authorizationCode?: OAuthFlowInterface | undefined;
  }

  export interface OAuthFlowInterface {
    authorizationUrl: string;
    tokenUrl: string;
    refreshUrl?: string | undefined;
    availableScopes: Record<string, string>;
  }

