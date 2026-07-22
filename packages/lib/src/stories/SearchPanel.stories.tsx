import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import SearchPanel from "../components/SearchPanel";
import { useSpecSearch } from "../hooks/useSpecSearch";
import { resolveDocument } from "../helpers/resolveDocument";
import type { AsyncAPIDocumentData } from "../types/schema";
import rawExample from "../config/examples/example1.json";
import { centeredDecorator } from "./documentContextDecorator";
import { ComponentProps } from "react";

// SearchPanel is a controlled component (query/results in, selection out) and
// needs no document context. To make the story interactive, useSpecSearch
// supplies real query state + Fuse-ranked results from the example spec:
// type "server", "light", "kafka", etc. to see live matches.
const document = resolveDocument(
  rawExample as unknown as Record<string, unknown>,
) as AsyncAPIDocumentData;

const meta = {
  title: "Internal/SearchPanel",
  component: SearchPanel,
  decorators: [centeredDecorator],
  // query/onQueryChange/results are supplied live by useSpecSearch in render
  // below; these defaults just satisfy the required-props story type.
  args: {
    query: "",
    onQueryChange: () => {},
    results: [],
    onSelectResult: fn(),
  },
} satisfies Meta<typeof SearchPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

const SearchHooks = (args: ComponentProps<typeof SearchPanel>) => {
  const { query, setQuery, results } = useSpecSearch(document);
  return (
    <SearchPanel
      {...args}
      query={query}
      onQueryChange={setQuery}
      results={results}
    />
  );
};

export const Default: Story = {
  render: (args) => <SearchHooks {...args} />,
};
