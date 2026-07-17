import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { AsyncAPIDocumentData } from "../types/schema";
import { buildSearchIndex } from "../helpers/searchIndex";

export interface UseSpecSearchOptions {
  threshold?: number;
  limit?: number;
}

export function useSpecSearch(asyncapi: AsyncAPIDocumentData, options: UseSpecSearchOptions = {}) {
  const [query, setQuery] = useState("");
  const searchIndex = useMemo(() => buildSearchIndex(asyncapi), [asyncapi]);

  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        // `path`/`location` are breadcrumb strings built for display in the
        // results dropdown (e.g. "Schemas > User > properties > email") —
        // nobody searches for those literally, and scoring against them just
        // dilutes real matches: Fuse's reported score is a weighted blend
        // across every key, so a query that only matches deep in `text`
        // (e.g. an Authorization/security description) gets dragged toward
        // "no match" by two irrelevant non-matching keys, and can rank below
        // unrelated noise in a large spec. `name` is weighted highest since
        // an identifier match is the strongest "this is what you meant" signal.
        keys: [
          { name: "name", weight: 2 },
          { name: "text", weight: 1 },
        ],
        threshold: options.threshold ?? 0.3,
        ignoreLocation: true,
        // Fuse penalizes matches by field length by default (a BM25-style
        // norm), independently of `ignoreLocation` — and `text` is a large
        // composite blob by design, so a dead-on substring match there was
        // still scoring ~0.85 (barely better than "no match") purely for
        // being long, letting shorter, coincidental matches outrank it.
        ignoreFieldNorm: true,
        includeScore: true,
      }),
    [searchIndex, options.threshold],
  );

  const results = useMemo(
    () =>
      query.trim()
        ? fuse
            .search(query.trim(), { limit: options.limit ?? 20 })
            .map((result) => result.item)
        : [],
    [fuse, query, options.limit],
  );

  return {
    query,
    setQuery,
    results,
    searchIndex,
  };
}
