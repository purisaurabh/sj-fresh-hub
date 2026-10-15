export function normalizeSearchQuery(query: string | null | undefined) {
  return (query ?? "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function stem(word: string) {
  if (word.length > 4 && word.endsWith("oes")) {
    return word.slice(0, -2);
  }
  if (word.length > 4 && word.endsWith("ies")) {
    return word.slice(0, -3);
  }
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

export type SearchableItem = {
  name: string;
  categoryName?: string | null;
};

/** Returns 0 when the item does not match; higher scores rank first. */
export function searchScore(item: SearchableItem, query: string) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    return 1;
  }

  const name = normalizeSearchQuery(item.name);
  const haystack = `${name} ${normalizeSearchQuery(item.categoryName)}`;
  const tokens = normalized.split(" ").map(stem);

  if (!tokens.every((token) => haystack.includes(token))) {
    return 0;
  }

  if (name === normalized) {
    return 4;
  }
  if (name.startsWith(tokens[0] ?? "")) {
    return 3;
  }
  if (tokens.every((token) => name.includes(token))) {
    return 2;
  }
  return 1;
}
