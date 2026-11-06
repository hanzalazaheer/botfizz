const KEY = "bf-explored";

/** Pages this visitor has opened, for the dashboard's explore progress. */
export function getExplored(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function markExplored(path: string) {
  if (path === "/dashboard") return;
  const explored = getExplored();
  if (!explored.includes(path)) {
    localStorage.setItem(KEY, JSON.stringify([...explored, path]));
  }
}
