import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Tabs from "../components/Tabs";
import IconOperation from "../icons/Operation";
import IconMessage from "../icons/Message";
import IconSchema from "../icons/Schema";
import { centeredDecorator } from "./documentContextDecorator";

// Tabs is a reusable, controlled tablist (roving-tabindex keyboard nav:
// arrows/Home/End). It renders two ways: with icons it uses an underlined
// tab bar, without icons a segmented button group; below @sm it collapses to
// a native <select>. Stories own `current` so switching is interactive.
const meta = {
  title: "Internal/Tabs",
  component: Tabs,
  decorators: [centeredDecorator],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const iconTabs = [
  { id: "operations", name: "Operations", icon: IconOperation },
  { id: "messages", name: "Messages", icon: IconMessage },
  { id: "schemas", name: "Schemas", icon: IconSchema },
];

const plainTabs = [
  { id: "request", name: "Request" },
  { id: "reply", name: "Reply" },
];

// Underlined tab-bar variant (tabs carry icons).
export const WithIcons: Story = {
  args: {
    tabs: iconTabs,
    current: iconTabs[0].id, // overridden by render's state
    ariaLabel: "Document sections",
  },
  render: (args) => {
    const [current, setCurrent] = useState(iconTabs[0].id);
    return <Tabs {...args} current={current} onChange={setCurrent} />;
  },
};

// Segmented button group variant (no icons).
export const Plain: Story = {
  args: {
    tabs: plainTabs,
    current: plainTabs[0].id, // overridden by render's state
    ariaLabel: "Message direction",
  },
  render: (args) => {
    const [current, setCurrent] = useState(plainTabs[0].id);
    return <Tabs {...args} current={current} onChange={setCurrent} />;
  },
};
