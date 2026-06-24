import { ConfigInterface } from "./config";

export const defaultConfig: ConfigInterface = {
  show: {
    sidebar: true,
    info: true,
    servers: true,
    operations: true,
    messages: true,
    messageExamples: false,
    schemas: false,
    errors: true,
  },
  expand: {
    //:TODO: add more expand options in the future especially for schemas
  },
  sidebar: {
    useChannelAddressAsIdentifier: false,
  },
};
