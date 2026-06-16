import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import SchemaTree from "../components/schema/SchemaTree";
import { AsyncAPIDocumentContext } from "../contexts";
import example1 from "../configs/examples/example1.json";
import example2 from "../configs/examples/example2.json";

const mockDocument = {
  ...example1,
  components: {
    ...example1.components,
    schemas: {
      ...example1.components?.schemas,
      ...example2.components?.schemas,
      nodeA: { $ref: "#/components/schemas/nodeB" },
      nodeB: { $ref: "#/components/schemas/nodeA" },
    },
  },
};

const deref = (refPath: string): unknown => {
  const parts = refPath.replace(/^#\//, "").split("/");
  let current: unknown = mockDocument;

  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    const decoded = part.replace(/~1/g, "/").replace(/~0/g, "~");
    current = (current as Record<string, unknown>)[decoded];
    if (current == null) return undefined;
  }

  return current;
};

const withSchemaContext = (Story: ComponentType) => (
  <AsyncAPIDocumentContext.Provider
    value={{ document: mockDocument, deref }}
  >
    <div className="max-w-3xl p-4">
      <Story />
    </div>
  </AsyncAPIDocumentContext.Provider>
);

const meta = {
  title: "Components/SchemaTree",
  component: SchemaTree,
  decorators: [withSchemaContext],
} satisfies Meta<typeof SchemaTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NestedObject: Story = {
  args: {
    rootName: "corporateStructure",
    schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Legal entity name." },
        hqAddress: {
          type: "object",
          description: "Headquarters address.",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
            zipCode: { type: "integer" },
          },
          required: ["street", "city"],
        },
        departments: {
          type: "array",
          description: "Company departments.",
          items: {
            type: "object",
            properties: {
              deptId: { type: "string" },
              headCount: { type: "number" },
            },
          },
        },
      },
      required: ["name"],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/departments\[\]/)).toBeInTheDocument();
    await expect(canvas.getByText(/departments\[\]\.deptId/)).toBeInTheDocument();
  },
};

export const RefChain: Story = {
  args: {
    rootName: "Payload",
    schema: {
      $ref: "#/components/schemas/lightMeasuredPayload",
    },
  },
};

export const OneOfComposite: Story = {
  args: {
    rootName: "subscriptionStatus",
    schema: example2.components?.schemas?.subscriptionStatus,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("One of:")).toBeInTheDocument();
    await expect(canvas.getByRole("tab", { name: "case 1" })).toBeInTheDocument();
    await expect(canvas.getByRole("tab", { name: "case 2" })).toBeInTheDocument();
    await expect(canvas.queryByText(/oneOf \(\d+\)/i)).not.toBeInTheDocument();
    await expect(canvas.queryByText(/\.oneOf\[/)).not.toBeInTheDocument();
    await expect(canvas.getByText(/Hide properties|Show properties/)).toBeInTheDocument();
    await expect(
      canvas.getByText(/subscriptionStatus\.errorMessage/)
    ).toBeInTheDocument();
  },
};

export const PropertyOneOf: Story = {
  args: {
    rootName: "BaseHeaders",
    schema: {
      type: "object",
      required: ["contentType"],
      properties: {
        contentType: {
          type: "string",
          const: "application/json",
        },
        "x-request-id": {
          oneOf: [
            {
              title: "UUID request id",
              type: "string",
              format: "uuid",
            },
            {
              title: "Prefixed request id",
              type: "string",
              pattern: "^req_[a-zA-Z0-9]+$",
            },
          ],
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/BaseHeaders\.x-request-id/)
    ).toBeInTheDocument();
    await expect(canvas.getByText(/one of \(2\)/i)).toBeInTheDocument();
    await expect(
      canvas.getByRole("tab", { name: "UUID request id" })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("tab", { name: "Prefixed request id" })
    ).toBeInTheDocument();
    await expect(canvas.getByText(/uuid/i)).toBeInTheDocument();

    const contentTypeRow = canvas.getByText(/BaseHeaders\.contentType/);
    const xRequestIdRow = canvas.getByText(/BaseHeaders\.x-request-id/);
    const oneOfLabel = canvas.getByText("One of:");
    expect(
      contentTypeRow.compareDocumentPosition(xRequestIdRow) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      xRequestIdRow.compareDocumentPosition(oneOfLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  },
};

export const PropertyAnyOf: Story = {
  args: {
    rootName: "BaseHeaders",
    schema: {
      type: "object",
      required: ["contentType"],
      properties: {
        contentType: {
          type: "string",
          const: "application/json",
        },
        "routing-key": {
          anyOf: [
            {
              title: "Critical routing",
              type: "string",
              const: "critical",
            },
            {
              title: "Tenant routing",
              type: "string",
              pattern: "^tenant\\.[a-z0-9-]+$",
            },
          ],
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/BaseHeaders\.routing-key/)
    ).toBeInTheDocument();
    await expect(canvas.getByText(/any of \(2\)/i)).toBeInTheDocument();
    await expect(
      canvas.getByRole("tab", { name: "Critical routing" })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("tab", { name: "Tenant routing" })
    ).toBeInTheDocument();
    await expect(canvas.getByText(/const: "critical"/i)).toBeInTheDocument();
    await expect(canvas.queryByText(/\.anyOf\[/)).not.toBeInTheDocument();

    const contentTypeRow = canvas.getByText(/BaseHeaders\.contentType/);
    const routingKeyRow = canvas.getByText(/BaseHeaders\.routing-key/);
    const anyOfLabel = canvas.getByText("Any of:");
    expect(
      contentTypeRow.compareDocumentPosition(routingKeyRow) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      routingKeyRow.compareDocumentPosition(anyOfLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  },
};

export const AllOfComposite: Story = {
  args: {
    rootName: "subscriptionStatusError",
    schema: example2.components?.schemas?.subscriptionStatusError,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/allOf/i)).not.toBeInTheDocument();
    await expect(canvas.getByText(/subscriptionStatusError\.errorMessage/)).toBeInTheDocument();
    await expect(canvas.getByText(/subscriptionStatusError\.event/)).toBeInTheDocument();
    await expect(canvas.queryByText(/\.allOf\[/)).not.toBeInTheDocument();
  },
};

export const ArrayWithItems: Story = {
  args: {
    rootName: "pair",
    schema: example2.components?.schemas?.pair,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("pair[]")).toBeInTheDocument();
    await expect(canvas.getByText(/Array of string/)).toBeInTheDocument();
    await expect(canvas.queryByLabelText("Expand")).not.toBeInTheDocument();
  },
};

export const CircularRef: Story = {
  args: {
    rootName: "nodeA",
    schema: { $ref: "#/components/schemas/nodeA" },
  },
};
