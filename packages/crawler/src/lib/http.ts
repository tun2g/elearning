/** Polite, rate-limited HTTP with a descriptive UA and retry on 429/5xx. */

export const USER_AGENT = 'SoundwellCrawler/0.1 (+https://soundwell.app; educational language-learning ingestion)';

const MIN_INTERVAL_MS = 1200;
let lastCall = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function throttle(): Promise<void> {
  const wait = MIN_INTERVAL_MS - (Date.now() - lastCall);
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
}

async function request(url: string, attempt = 0): Promise<Response> {
  await throttle();
  const res = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: '*/*' },
    redirect: 'follow',
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 3) {
    await sleep(1000 * (attempt + 1));
    return request(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res;
}

export async function fetchText(url: string): Promise<string> {
  return (await request(url)).text();
}

export async function fetchBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await request(url);
  const ab = await res.arrayBuffer();
  return {
    buffer: Buffer.from(ab),
    contentType: res.headers.get('content-type') ?? 'application/octet-stream',
  };
}
