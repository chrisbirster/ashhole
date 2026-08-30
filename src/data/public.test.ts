import { describe, expect, it } from 'vitest';
import { archiveCards, awards, originalEight } from './public.js';

describe('public legacy data', () => {
  it('preserves the original eight', () => expect(originalEight).toHaveLength(8));
  it('keeps awards in descending order', () => expect(awards[0].year).toBeGreaterThan(awards.at(-1)!.year));
  it('uses 2024 as the latest complete photo archive', () => expect(Math.max(...archiveCards.map((x) => x.year))).toBe(2024));
});
