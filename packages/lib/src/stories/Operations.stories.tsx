import type { Meta, StoryObj } from "@storybook/react";
import { Operations } from "../public/sections";
import type { AsyncAPIDocumentData } from "../types/schema";
import rawExample from "../config/examples/example1.json";
import { centeredDecorator } from "./documentContextDecorator";

// The public `Operations` section: pass a `document` and it renders that
// document's operations table standalone. Clicking a row opens the detail
// side panel — the wrapper owns that selection state internally, so selection
// isn't a prop of the public API.
const document = rawExample as unknown as AsyncAPIDocumentData;

const meta = {
  title: "Components/Operations",
  component: Operations,
  decorators: [centeredDecorator],
} satisfies Meta<typeof Operations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { document },
};
