import type { Meta, StoryObj } from "@storybook/react";
import Information from "../containers/Information/Information";
import example from "../configs/examples/example.json";

const meta = {
  title: "Components/Information",
  component: Information,
  // parameters: {
  //   layout: 'centered',
  // },
} satisfies Meta<typeof Information>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { ...example.info },
};
