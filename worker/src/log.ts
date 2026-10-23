export type Outcome = 'answered' | 'unknown' | 'declined' | 'blocked' | 'replaced' | 'fallback';

const stopwords = new Set('a an and are about any can could did do does for from has have he her his how i in is it me my of on or so tell than that the their them there this tim tims to was what when where which who why will with would you your'.split(' '));

/**
 * Up to 4 keywords from a question, kept only for gap analysis. Emails, links,
 * numbers and short or common words are dropped so nothing identifying is stored.
 */
export function keywords(text: string): string {
  return text.toLowerCase()
    .replace(/[\w.+-]+@[\w.-]+/g, ' ')
    .replace(/\b(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word))
    .slice(0, 4)
    .join(' ')
    .slice(0, 40);
}

export interface ChatLogEntry { topic: string; outcome: Outcome; turn: number; question: string }

/** One anonymous data point per request: no IP, no session, no message text beyond gap keywords. */
export function logChat(dataset: AnalyticsEngineDataset | undefined, entry: ChatLogEntry): void {
  const gap = entry.topic === 'uncategorized' || entry.outcome === 'unknown';
  dataset?.writeDataPoint({
    indexes: [entry.topic],
    blobs: [entry.topic, entry.outcome, gap ? keywords(entry.question) : ''],
    doubles: [entry.turn],
  });
}
