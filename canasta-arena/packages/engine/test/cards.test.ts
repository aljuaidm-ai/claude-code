import { describe, expect, it } from 'vitest';
import { cardPoints, makeDeck, shuffle } from '../src/cards';
import { initialMeldMinimum } from '../src/rules';
import { c } from './helpers';

describe('R2 cards', () => {
  it('R2.1 deck has 108 cards: 8 of each rank and 4 jokers', () => {
    const deck = makeDeck();
    expect(deck).toHaveLength(108);
    expect(new Set(deck.map((x) => x.id)).size).toBe(108);
    expect(deck.filter((x) => x.rank === 'JK')).toHaveLength(4);
    expect(deck.filter((x) => x.rank === 'K')).toHaveLength(8);
    expect(deck.filter((x) => x.rank === '3' && (x.suit === 'H' || x.suit === 'D'))).toHaveLength(4);
  });
  it('R2.3 card values', () => {
    expect(cardPoints(c('JK'))).toBe(50);
    expect(cardPoints(c('2'))).toBe(20);
    expect(cardPoints(c('A'))).toBe(20);
    expect(cardPoints(c('K'))).toBe(10);
    expect(cardPoints(c('8'))).toBe(10);
    expect(cardPoints(c('7'))).toBe(5);
    expect(cardPoints(c('4'))).toBe(5);
    expect(cardPoints(c('3', 'S'))).toBe(5);
    expect(cardPoints(c('3', 'H'))).toBe(0);
  });
  it('shuffle is deterministic per seed', () => {
    expect(shuffle(makeDeck(), 42)).toEqual(shuffle(makeDeck(), 42));
    expect(shuffle(makeDeck(), 42)).not.toEqual(shuffle(makeDeck(), 43));
  });
});

describe('R6.6 minimum first meld', () => {
  it.each([[-5, 15], [0, 50], [1495, 50], [1500, 90], [2995, 90], [3000, 120], [4800, 120]])(
    'score %i needs %i', (score, need) => expect(initialMeldMinimum(score)).toBe(need));
});
