/** Vocabulary enrichment from open sources (robots-clean, callable APIs).
 *  - Free Dictionary API (Wiktionary-derived): IPA, English definition, synonyms.
 *  - MyMemory translation API: Vietnamese gloss (required meaningVn).
 *  (English Wiktionary's /w/ + /api/ are robots-disallowed, so it can't be crawled
 *   politely for translations.) Both are best-effort: any failure returns null so
 *   the caller can report a gap rather than fabricate a meaning. */

import { fetchText } from './http';
import { isAllowed } from './robots';

const FREE_DICT = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const MYMEMORY = 'https://api.mymemory.translated.net/get';

export interface WordDefinition {
  ipa: string | null;
  meaningEn: string | null;
  synonyms: string[];
  audioUrl: string | null;
}

interface FreeDictPhonetic {
  text?: string;
  audio?: string;
}
interface FreeDictDefinition {
  definition?: string;
  synonyms?: string[];
}
interface FreeDictMeaning {
  definitions?: FreeDictDefinition[];
  synonyms?: string[];
}
interface FreeDictEntry {
  phonetic?: string;
  phonetics?: FreeDictPhonetic[];
  meanings?: FreeDictMeaning[];
}

/** IPA + English definition + synonyms from the Free Dictionary API. */
export async function fetchDefinition(word: string): Promise<WordDefinition | null> {
  const url = `${FREE_DICT}/${encodeURIComponent(word)}`;
  if (!(await isAllowed(url))) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(await fetchText(url));
  } catch {
    return null; // 404 "No Definitions Found" or network error
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  const entry = parsed[0] as FreeDictEntry;

  const ipa = entry.phonetic ?? entry.phonetics?.find((p) => p.text)?.text ?? null;
  const rawAudio = entry.phonetics?.find((p) => p.audio)?.audio ?? null;
  const audioUrl = rawAudio ? (rawAudio.startsWith('//') ? `https:${rawAudio}` : rawAudio) : null;

  const meanings = entry.meanings ?? [];
  const meaningEn = meanings[0]?.definitions?.[0]?.definition ?? null;
  const synonyms = new Set<string>();
  for (const m of meanings) {
    for (const s of m.synonyms ?? []) synonyms.add(s);
    for (const d of m.definitions ?? []) for (const s of d.synonyms ?? []) synonyms.add(s);
  }

  return { ipa, meaningEn, synonyms: [...synonyms].slice(0, 6), audioUrl };
}

interface MyMemoryResponse {
  responseStatus?: number;
  responseData?: { translatedText?: string };
}

/** Reject untranslated / quota-warning / error payloads MyMemory can return. */
function isUsableGloss(word: string, text: string): boolean {
  if (!text) return false;
  if (/MYMEMORY WARNING|INVALID|NO QUERY|QUERY LENGTH LIMIT/i.test(text)) return false;
  if (text.toLowerCase() === word.toLowerCase()) return false; // returned the source word
  return true;
}

/** Vietnamese gloss from the MyMemory translation API (en→vi). */
export async function fetchVietnamese(word: string): Promise<string | null> {
  const url = `${MYMEMORY}?q=${encodeURIComponent(word)}&langpair=en|vi`;
  if (!(await isAllowed(url))) return null;

  let parsed: MyMemoryResponse;
  try {
    parsed = JSON.parse(await fetchText(url)) as MyMemoryResponse;
  } catch {
    return null;
  }
  if (parsed.responseStatus !== 200) return null;

  const text = (parsed.responseData?.translatedText ?? '').trim();
  return isUsableGloss(word, text) ? text : null;
}
