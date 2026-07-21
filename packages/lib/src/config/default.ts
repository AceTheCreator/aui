import { ConfigInterface } from "./config";
import { DEFAULT_DEPTH_COLORS } from "../components/schema/depthColors";

export const defaultConfig: ConfigInterface = {
  show: {
    sidebar: true,
    info: true,
    servers: true,
    search: true,
    operations: true,
    messages: true,
    messageExamples: false,
    schemas: true,
    // errors: true,
  },
  theme: {
    colors: {
      primary: {
        50:  "#ebf1fe",
        100: "#d6e3fd",
        200: "#adc7fb",
        300: "#85abf9",
        500: "#7aa2f7",
        600: "#5a7ef0",
        700: "#3d5bc4",
      },
    },
    depthColors: DEFAULT_DEPTH_COLORS,
  },
  expand: {
    schemas: false,
  },
  sidebar: {
    useChannelAddressAsIdentifier: false,
  },
};
