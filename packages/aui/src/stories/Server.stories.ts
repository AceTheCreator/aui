import type { Meta, StoryObj } from "@storybook/react";
import Servers from "../containers/Server/Servers";
import type { Server as ServerInterface } from "../types/asyncapi/Server";
import example from "../config/examples/example1.json";

const meta = {
  title: "Components/Servers",
  component: Servers,
  // parameters: {
  //   layout: 'centered',
  // },
} satisfies Meta<typeof Servers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    servers: example.servers as unknown as Record<string, ServerInterface>,
  },
};
