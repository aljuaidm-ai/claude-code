import { describe, expect, it } from 'vitest';
import { isRed3 } from '../src/cards';
import { allCards, apply, newGame } from '../src/engine';
import { botStep } from '../src/index';
import { CLASSIC_DOUBLES, CLASSIC_SINGLES, CLASSIC_SINGLES_QUICK, type RuleSet } from '../src/rules';
import type { GameState } from '../src/state';

function playOut(rules: RuleSet, seed: number): GameState {
  let s = newGame(rules, seed);
  for (let step = 0; step < 50000; step++) {
    if (s.phase === 'gameOver') return s;
    if (s.phase === 'handOver') {
      const r = apply(s, 0, { t: 'nextHand' });
      if (!r.ok) throw new Error(r.code);
      s = r.state;
      continue;
    }
    s = botStep(s).state;
    const all = allCards(s);
    if (all.length !== 108 || new Set(all.map((c) => c.id)).size !== 108) throw new Error(`card leak at step ${step}`);
    if (s.hands.flat().some(isRed3)) throw new Error('red 3 in hand');
  }
  throw new Error('game did not finish');
}

describe('bot-vs-bot games (every move validated by the engine)', () => {
  for (const rules of [CLASSIC_SINGLES, CLASSIC_SINGLES_QUICK, CLASSIC_DOUBLES]) {
    it(`${rules.id}: 25 full games finish with no lost cards`, () => {
      for (let seed = 1; seed <= 25; seed++) {
        const s = playOut(rules, seed);
        expect(s.phase).toBe('gameOver');
        expect(Math.max(...s.scores)).toBeGreaterThanOrEqual(rules.target);
        const sums = s.history.reduce((acc, h) => [acc[0] + h.teams[0].total, acc[1] + h.teams[1].total], [0, 0]);
        expect(sums).toEqual(s.scores);
      }
    });
  }
});
