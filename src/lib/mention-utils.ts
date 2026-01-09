// Utilitários para menções (@username)

export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  return matches?.map((m) => m.slice(1)) || [];
}

export function hasMentions(text: string): boolean {
  return /@\w+/.test(text);
}
