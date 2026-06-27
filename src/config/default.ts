import { ConfigInterface } from "./config";

export const defaultConfig: ConfigInterface = {
  show: {
    sidebar: true,
    info: true,
    servers: true,
    operations: true,
    messages: true,
    messageExamples: false,
    schemas: true,
    // errors: true,
  },
  theme: {
    colors: {
      background: "#0f172a",
      surface: "#000000",
      border: "#334155",

      textPrimary: "#f8fafc",
      textSecondary: "#cbd5e1",
      textMuted: "#ffffff",
    },
  },
  expand: {
    //:TODO: add more expand options in the future especially for schemas
  },
  sidebar: {
    useChannelAddressAsIdentifier: false,
  },
};
