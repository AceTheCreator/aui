export interface ConfigInterface {
  show?: ShowConfig;
  expand?: ExpandConfig;
  sidebar?: SideBarConfig;
  theme?: ThemeConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parserOptions?: any;
  requestLabel?: string;
  replyLabel?: string;
}

export interface ShowConfig {
  sidebar?: boolean;
  info?: boolean;
  servers?: boolean;
  operations?: boolean;
  messages?: boolean;
  messageExamples?: boolean;
  schemas?: boolean;
  errors?: boolean;
}

export interface ExpandConfig {
  messageExamples?: boolean;
}

export interface SideBarConfig {
  useChannelAddressAsIdentifier?: boolean;
}

export interface ThemeConfig {
  primary?: {
    50?: string;
    100?: string;
    200?: string;
    300?: string;
    500?: string;
    600?: string;
    700?: string;
  };
  secondary?: {
    50?: string;
    100?: string;
    200?: string;
    300?: string;
    500?: string;
    600?: string;
    700?: string;
  };
  neutral?: {
    50?: string;
    100?: string;
    200?: string;
    300?: string;
    500?: string;
    600?: string;
    700?: string;
  };
}
