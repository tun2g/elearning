import robotsParser from 'robots-parser';

import { fetchText, USER_AGENT } from './http';

const cache = new Map<string, ReturnType<typeof robotsParser>>();

/** Returns true if the crawler UA is allowed to fetch `url` per the site's robots.txt. */
export async function isAllowed(url: string): Promise<boolean> {
  try {
    const origin = new URL(url).origin;
    let robots = cache.get(origin);
    if (!robots) {
      let body = '';
      try {
        body = await fetchText(`${origin}/robots.txt`);
      } catch {
        body = '';
      }
      robots = robotsParser(`${origin}/robots.txt`, body);
      cache.set(origin, robots);
    }
    return robots.isAllowed(url, USER_AGENT) ?? true;
  } catch {
    return true;
  }
}
