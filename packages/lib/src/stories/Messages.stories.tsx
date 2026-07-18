import type { Meta, StoryObj } from "@storybook/react";
import Messages from "../containers/Messages/Messages";
import type { MessageObject } from "../types/asyncapi/MessageObject";
import rawExample from "../config/examples/example1.json";
import { buildDocumentContext } from "./documentContextDecorator";

const { document, decorator } = buildDocumentContext(rawExample);
const messages = (document.components as { messages?: Record<string, MessageObject> })
  ?.messages as Record<string, MessageObject>;

const meta = {
  title: "Components/Messages",
  component: Messages,
  decorators: [decorator],
} satisfies Meta<typeof Messages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    messages,
  },
};

// Pre-selecting a message auto-expands its details row (payload/headers).
export const WithSelectedMessage: Story = {
  args: {
    messages,
    selectedKey: Object.keys(messages)[0],
  },
};
