import { describe, expect, it } from 'vitest';
import { isRed3, isWild } from '../src/cards';
import { allCards, newGame } from '../src/engine';
import { CLASSIC_DOUBLES, CLASSIC_SINGLES } from '../src/rules';

describe('R3 deal', () => {
  it('R1/R3.1 Doubles deals 11 each; Singles deals 15 each', () => {
    expect(newGame(CLASSIC_DOUBLES, 7).hands.map((h) => h.length)).toEqual([11, 11, 11, 11]);
    expect(newGame(CLASSIC_SINGLES, 7).hands.map((h) => h.length)).toEqual([15, 15]);
  });
  it('R3.3 no red 3 stays in a hand, and all 108 cards are accounted for', () => {
    for (let seed = 1; seed < 200; seed++) {
      const s = newGame(CLASSIC_DOUBLES, seed);
      expect(s.hands.flat().some(isRed3)).toBe(false);
      const all = allCards(s);
      expect(all).toHaveLength(108);
      expect(new Set(all.map((x) => x.id)).size).toBe(108);
    }
  });
  it('R3.2 a wild or red 3 up-card is covered and freezes the pile', () => {
    let found = false;
    for (let seed = 1; seed < 500 && !found; seed++) {
      const s = newGame(CLASSIC_DOUBLES, seed);
      if (s.pile.length > 1) {
        found = true;
        expect(s.pileFrozenAll).toBe(true);
        expect(isWild(s.pile[0]) || isRed3(s.pile[0])).toBe(true);
        const top = s.pile[s.pile.length - 1];
        expect(isWild(top) || isRed3(top)).toBe(false);
      }
    }
    expect(found).toBe(true);
  });
  it('R1.2 player left of the dealer starts', () => {
    const s = newGame(CLASSIC_DOUBLES, 3);
    expect(s.turn).toBe((s.dealer + 1) % 4);
    expect(s.phase).toBe('draw');
  });
});
