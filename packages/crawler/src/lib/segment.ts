/**
 * Splits a block of prose into practiceable sentences and filters out non-prose
 * (media-player boilerplate, resolution/size junk, nav chrome). Conservative by
 * design — better to drop a borderline line than ship garbage for review.
 */

// Common web/video-player chrome that Readability sometimes pulls in.
const BOILERPLATE =
  /(no media source|copied to your clipboard|pop-?out player|\bembed\b|\bshare\b|width px|height px|\b\d+\s?[kmg]b\b|\b\d{2,4}p\b|\bkbps\b|click here|cookie|subscribe|advertisement)/i;

function isProse(s: string): boolean {
  if (s.length < 20 || s.length > 240) return false;
  if (BOILERPLATE.test(s)) return false;

  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 4) return false;

  // Reject lines dominated by digits/symbols (e.g. "7MB 360p | 9.").
  const letters = (s.match(/[a-z]/gi) ?? []).length;
  if (letters / s.length < 0.6) return false;

  return true;
}

export function segmentSentences(text: string, max = 40): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  const parts = clean.match(/[^.!?]+[.!?]+["')\]]*|\S[^.!?]*$/g) ?? [];
  const out: string[] = [];

  for (const raw of parts) {
    const sentence = raw.trim();
    if (!isProse(sentence)) continue;
    out.push(sentence);
    if (out.length >= max) break;
  }

  return out;
}
