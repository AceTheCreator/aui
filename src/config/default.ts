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
    // errors: true,
  },
  theme: {
    mode: "dark",
    primary: {
      50: "#76d3fefd",
      100: "#E0F2FE",
      200: "#BAE6FD",
      300: "#7DD3FC",
      500: "#0EA5E9",
      600: "#0284C7",
      700: "#0369A1",
    },
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
