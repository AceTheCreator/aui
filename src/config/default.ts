import { ConfigInterface } from "./config";

export const defaultConfig: ConfigInterface = {
  show: {
    sidebar: true,
    info: false,
    servers: false,
    operations: true,
    messages: true,
    messageExamples: false,
    schemas: false,
    errors: true,
  },
  expand: {
    messageExamples: false,
  },
  sidebar: {
    useChannelAddressAsIdentifier: true,
  },
};
