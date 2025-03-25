import type { Meta, StoryObj } from "@storybook/react";
import Information from "../containers/Information/Information";

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
  args: {
    title: "Dummy example with all spec features included",
    version: "0.0.1",
    "x-logo": "https://logoipsum.com/logo/logo-26.svg",
    description:
      "This is an example of AsyncAPI specification file that is supposed to include all possible features of the AsyncAPI specification. Do not use it on production.\n\nIt's goal is to support development of documentation and code generation with the [AsyncAPI Generator](https://github.com/asyncapi/generator/) and [Template projects](https://github.com/search?q=topic%3Aasyncapi+topic%3Agenerator+topic%3Atemplate).",
    license: {
      name: "Apache 2.0",
      url: "https://www.apache.org/licenses/LICENSE-2.0",
    },
    contact: {
      name: "API Support",
      url: "http://www.asyncapi.com/support",
      email: "info@asyncapi.io",
    },
    tags: [
      {
        name: "root-tag1",
        externalDocs: {
          description: "External docs description 1",
          url: "https://www.asyncapi.com/",
        },
      },
      {
        name: "root-tag2",
        description: "Description 2",
        externalDocs: {
          url: "https://www.asyncapi.com/",
        },
      },
      {
        name: "root-tag2",
        description: "Description 2",
        externalDocs: {
          url: "https://www.asyncapi.com/",
        },
      },
      {
        name: "root-tag2",
        description: "Description 2",
      },
      {
        name: "root-tag2",
        description: "Description 2",
      },
      {
        name: "root-tag2",
        description: "Description 2",
        externalDocs: {
          url: "https://www.asyncapi.com/",
        },
      },
      {
        name: "root-tag5",
        externalDocs: {
          url: "https://www.asyncapi.com/",
        },
      },
    ],
    "x-twitter": "@AsyncAPISpec",
  },
};
