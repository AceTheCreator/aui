import type { Meta, StoryObj } from "@storybook/react";
import Servers from "../containers/Server/Servers";
import type { Server as ServerInterface } from "../types/asyncapi/Server";
import rawExample from "../config/examples/example1.json";
import { buildDocumentContext } from "./documentContextDecorator";

const { document, decorator } = buildDocumentContext(rawExample);
const servers = document.servers as unknown as Record<string, ServerInterface>;

const meta = {
  title: "Components/Servers",
  component: Servers,
  decorators: [decorator],
} satisfies Meta<typeof Servers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    servers,
  },
};

export const SingleServer: Story = {
  args: {
    servers: Object.fromEntries(
      Object.entries(servers).slice(0, 1),
    ) as Record<string, ServerInterface>,
  },
};
