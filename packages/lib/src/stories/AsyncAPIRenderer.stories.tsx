import type { Meta, StoryObj } from "@storybook/react";
import { AsyncAPIRenderer } from "../containers/AsyncAPI/AsyncAPIRenderer";
import example1 from "../config/examples/streetlight.json";

const raw = JSON.stringify(example1);

const meta = {
  title: "Components/AsyncAPIRenderer",
  component: AsyncAPIRenderer,
} satisfies Meta<typeof AsyncAPIRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    raw,
  },
};

export const WithDiagnosticsCallback: Story = {
  args: {
    raw,
    onDiagnostics: (diagnostics) => console.log("diagnostics", diagnostics),
  },
};

export const InvalidDocument: Story = {
  args: {
    raw: JSON.stringify({ asyncapi: "3.0.0" }),
    onDiagnostics: (diagnostics) => console.log("diagnostics", diagnostics),
  },
};
