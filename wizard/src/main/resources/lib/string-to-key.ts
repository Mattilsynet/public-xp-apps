export function stringToKey(s?: string): string | undefined {
  return s?.replace(/[^a-zA-Z0-9]+/g, '-')?.toLowerCase()
}
