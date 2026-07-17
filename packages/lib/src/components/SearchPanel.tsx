import { SearchEntry } from "../helpers/searchIndex";
import Section from "./Section";

interface SearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: SearchEntry[];
  onSelectResult: (entry: SearchEntry) => void;
}

const TAB_LABELS: Record<SearchEntry["tab"], string> = {
  operations: "Operations",
  messages: "Messages",
  schemas: "Schemas",
  info: "Info",
  servers: "Servers",
};

export default function SearchPanel({
  query,
  onQueryChange,
  results,
  onSelectResult,
}: SearchPanelProps) {

  const content =     <div className="relative mb-4">
      <input
        id="asyncapi-search"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search operations, messages, schemas, servers..."
        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary-300"
      />
      {query.trim() && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
          {results.length > 0 ? (
            <ul className="divide-y divide-border">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => onSelectResult(result)}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50"
                  >
                    <div className="text-sm font-semibold text-foreground">{result.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
                      <span>{TAB_LABELS[result.tab]}</span>
                      <span>{result.location}</span>
                      {result.subtitle && <span>• {result.subtitle}</span>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-4 text-sm text-foreground-muted">No results found.</div>
          )}
        </div>
      )}
    </div>

  return (
    <div>
      <Section
        content={content}
        sideContent={null}
        stickySideContent={false}
        reverseLayoutOnMobile={true}
        info={true}
        />
    </div>
  );
}
