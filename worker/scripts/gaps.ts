// Monthly gap list from the anonymous chat log (Workers Analytics Engine, free).
// Needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Account Analytics: Read).
//   npm run gaps            (last 30 days)
//   npm run gaps -- 7       (last 7 days)
const days = Number(process.argv[2] ?? 30);
const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_API_TOKEN: token } = process.env;
if (!account || !token) {
  console.error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN first.');
  process.exit(1);
}

async function sql(query: string): Promise<Record<string, string>[]> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/analytics_engine/sql`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: query,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return ((await res.json()) as { data: Record<string, string>[] }).data;
}

const since = `timestamp > NOW() - INTERVAL '${days}' DAY`;
const byTopic = await sql(`SELECT blob1 AS topic, blob2 AS outcome, SUM(_sample_interval) AS n FROM ask_tim_chat WHERE ${since} GROUP BY topic, outcome ORDER BY n DESC`);
const gaps = await sql(`SELECT blob3 AS keywords, SUM(_sample_interval) AS n FROM ask_tim_chat WHERE ${since} AND blob3 != '' GROUP BY keywords ORDER BY n DESC LIMIT 30`);

console.log(`\nQuestions by topic and outcome, last ${days} days`);
console.table(byTopic);
console.log('\nGaps: keywords from unknown or uncategorized questions (add facts to docs/persona.md)');
console.table(gaps);

export {};
