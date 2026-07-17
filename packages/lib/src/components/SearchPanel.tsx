import { useEffect, useRef, useState } from "react";
import { SearchEntry } from "../helpers/searchIndex";
import Section from "./Section";

interface SearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: SearchEntry[];
  onSelectResult: (entry: SearchEntry) => void;
}

export default function SearchPanel({
  query,
  onQueryChange,
  results,
  onSelectResult,
}: SearchPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // A fresh query (typing) always reopens the dropdown, independent of
  // whatever an earlier outside click did.
  useEffect(() => {
    if (query.trim()) setIsOpen(true);
  }, [query]);

  // Closes on any click outside the input + dropdown — `mousedown` (not
  // `click`) so this fires before a result button's own click handler.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const showDropdown = isOpen && query.trim().length > 0;

  const handleSelectResult = (result: SearchEntry) => {
    setIsOpen(false);
    onSelectResult(result);
  };

  const content =     <div className="relative mb-4" ref={containerRef}>
      <input
        id="asyncapi-search"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => {
          if (query.trim()) setIsOpen(true);
        }}
        placeholder="Search document..."
        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary-300"
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
          {results.length > 0 ? (
            <ul className="divide-y divide-border">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50"
                  >
                    <div className="text-sm font-semibold text-foreground">{result.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
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
