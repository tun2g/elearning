import { describe, expect, it } from 'vitest';

import { alignWords, scoreToGrade } from './practice';

describe('alignWords', () => {
  it('marks every word ok on an exact match', () => {
    const r = alignWords('I went to the store', 'I went to the store');
    expect(r.map((w) => w.status)).toEqual(['ok', 'ok', 'ok', 'ok', 'ok']);
    expect(r.map((w) => w.text)).toEqual(['I', 'went', 'to', 'the', 'store']);
  });

  it('is case- and punctuation-insensitive', () => {
    const r = alignWords('Hello, world!', 'hello world');
    expect(r.map((w) => w.status)).toEqual(['ok', 'ok']);
    // display preserves the reference surface form
    expect(r.map((w) => w.text)).toEqual(['Hello,', 'world!']);
  });

  it('flags a substituted word and records what was heard', () => {
    const r = alignWords('I went to the store', 'I want to the store');
    expect(r[1]).toMatchObject({ text: 'went', status: 'substituted', heardAs: 'want' });
    expect(r.filter((w) => w.status === 'ok')).toHaveLength(4);
  });

  it('flags an omitted word when the speaker skips one', () => {
    const r = alignWords('I went to the store', 'I went to store');
    const omitted = r.filter((w) => w.status === 'omitted');
    expect(omitted).toHaveLength(1);
    expect(omitted[0].text).toBe('the');
  });

  it('flags an inserted word when the speaker adds one', () => {
    const r = alignWords('I went to store', 'I went to the store');
    const inserted = r.filter((w) => w.status === 'inserted');
    expect(inserted).toHaveLength(1);
    expect(inserted[0].text).toBe('the');
  });

  it('preserves reference order', () => {
    const r = alignWords('one two three', 'one three');
    expect(r.map((w) => w.text)).toEqual(['one', 'two', 'three']);
    expect(r.map((w) => w.status)).toEqual(['ok', 'omitted', 'ok']);
  });

  it('handles an empty transcription as all omitted', () => {
    const r = alignWords('two words', '');
    expect(r.map((w) => w.status)).toEqual(['omitted', 'omitted']);
  });
});

describe('scoreToGrade', () => {
  it('maps low scores to again', () => {
    expect(scoreToGrade(0)).toBe('again');
    expect(scoreToGrade(59)).toBe('again');
  });

  it('maps mid scores to hard', () => {
    expect(scoreToGrade(60)).toBe('hard');
    expect(scoreToGrade(84)).toBe('hard');
  });

  it('maps high scores to easy', () => {
    expect(scoreToGrade(85)).toBe('easy');
    expect(scoreToGrade(100)).toBe('easy');
  });
});
