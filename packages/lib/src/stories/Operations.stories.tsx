import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Operations from "../containers/Operation/Operations";
import type { Operation as OperationType } from "../types/asyncapi/Operation";
import rawExample from "../config/examples/example1.json";
import { buildDocumentContext } from "./documentContextDecorator";

const { document, decorator } = buildDocumentContext(rawExample);
const operations = document.operations as unknown as Record<string, OperationType>;

const meta = {
  title: "Components/Operations",
  component: Operations,
  decorators: [decorator],
} satisfies Meta<typeof Operations>;

export default meta;
type Story = StoryObj<typeof meta>;

// Clicking a row opens the detail side panel — Operations is a controlled
// component (selectedKey/onSelectKey), so the story owns that state to make
// selection interactive rather than a static list.
export const Default: Story = {
  args: {
    operations,
  },
  render: (args) => {
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    return (
      <Operations
        {...args}
        selectedKey={selectedKey}
        onSelectKey={setSelectedKey}
      />
    );
  },
};

// Opens with the first operation's detail panel already showing.
export const WithSelectedOperation: Story = {
  args: {
    operations,
    selectedKey: Object.keys(operations)[0],
  },
};
