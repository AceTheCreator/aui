import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const resultsId = "asyncapi-search-results";

  // A fresh query (typing) always reopens the dropdown, independent of
  // whatever an earlier outside click did.
  useEffect(() => {
    if (query.trim()) {
      setIsOpen(true);
      setActiveIndex(-1);
    } else {
      setIsOpen(false);
    }
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

  useEffect(() => {
    if (activeIndex >= results.length) {
      setActiveIndex(results.length - 1);
    }
  }, [activeIndex, results.length]);

  const handleSelectResult = (result: SearchEntry) => {
    setIsOpen(false);
    setActiveIndex(-1);
    onSelectResult(result);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        results.length === 0 ? -1 : Math.min(current + 1, results.length - 1)
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        results.length === 0
          ? -1
          : current <= 0
          ? results.length - 1
          : current - 1
      );
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      if (results.length > 0) setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      if (results.length > 0) setActiveIndex(results.length - 1);
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      handleSelectResult(results[activeIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
  };

  const resultItemId = (index: number) => `asyncapi-search-result-${index}`;
  const resultCountText = showDropdown
    ? `${results.length} result${results.length === 1 ? "" : "s"} found`
    : "";

  const content = (
    <div className="relative mb-4" ref={containerRef}>
      <input
        id="asyncapi-search"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => {
          if (query.trim()) setIsOpen(true);
        }}
        onKeyDown={handleInputKeyDown}
        placeholder="Search document..."
        aria-label="Search document"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={showDropdown}
        aria-controls={resultsId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? resultItemId(activeIndex) : undefined}
        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary-300"
      />
      <div aria-live="polite" className="sr-only">
        {resultCountText}
      </div>
      {showDropdown && (
        <div
          id={resultsId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg"
        >
          {results.length > 0 ? (
            <ul className="divide-y divide-border">
              {results.map((result, index) => (
                <li key={result.id}>
                  <button
                    id={resultItemId(index)}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === index}
                    onClick={() => handleSelectResult(result)}
                    className={"w-full text-left px-4 py-3 hover:bg-neutral-50 " +
                      (activeIndex === index ? "bg-neutral-100" : "")}
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
  );

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
